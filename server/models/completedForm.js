import db from '../config/db.js';

const ALLOWED_STATUSES = ['draft', 'completed'];

export const isValidStatus = (status) => {
  return ALLOWED_STATUSES.includes(status);
};

export const getAllCompletedForms = async (client = null) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT cf.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM completed_forms cf
     LEFT JOIN customers c ON c.id = cf.customer_id
     ORDER BY cf.created_at DESC`
  );

  return result.rows;
};

export const getCompletedFormById = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT * FROM completed_forms WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const getCompletedFormWithDetails = async (client = null, id) => {
  const queryExecutor = client || db;

  const formRes = await queryExecutor.query(
    `SELECT cf.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
     FROM completed_forms cf
     LEFT JOIN customers c ON c.id = cf.customer_id
     WHERE cf.id = $1`,
    [id]
  );

  if (!formRes.rows[0]) {
    return null;
  }

  const form = formRes.rows[0];

  let appointment = null;
  if (form.appointment_id) {
    const appointmentRes = await queryExecutor.query(
      `SELECT id, booking_datetime, status FROM bookings WHERE id = $1`,
      [form.appointment_id]
    );
    appointment = appointmentRes.rows[0] || null;
  }

  const templateRes = await queryExecutor.query(
    `SELECT id, name, description FROM form_templates WHERE id = $1`,
    [form.form_template_id]
  );

  const questionsRes = await queryExecutor.query(
    `SELECT * FROM completed_form_questions
     WHERE completed_form_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [id]
  );

  const questions = await Promise.all(
    questionsRes.rows.map(async (question) => {
      const optionsRes = await queryExecutor.query(
        `SELECT * FROM completed_form_question_options
         WHERE completed_form_question_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [question.id]
      );

      const answerRes = await queryExecutor.query(
        `SELECT * FROM form_answers
         WHERE completed_form_id = $1 AND completed_form_question_id = $2
         ORDER BY created_at ASC LIMIT 1`,
        [id, question.id]
      );

      return {
        ...question,
        options: optionsRes.rows,
        answer: answerRes.rows[0] || null
      };
    })
  );

  return {
    ...form,
    customer: form.customer_id ? {
      id: form.customer_id,
      name: form.customer_name,
      email: form.customer_email,
      phone: form.customer_phone
    } : null,
    appointment,
    form_template: templateRes.rows[0] || null,
    questions
  };
};

export const getCompletedFormsByCustomer = async (client = null, customerId) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT cf.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM completed_forms cf
     LEFT JOIN customers c ON c.id = cf.customer_id
     WHERE cf.customer_id = $1
     ORDER BY cf.created_at DESC`,
    [customerId]
  );

  return result.rows;
};

export const getCompletedFormsByAppointment = async (client = null, appointmentId) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `SELECT cf.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM completed_forms cf
     LEFT JOIN customers c ON c.id = cf.customer_id
     WHERE cf.appointment_id = $1
     ORDER BY cf.created_at DESC`,
    [appointmentId]
  );

  return result.rows;
};

export const createCompletedForm = async (client = null, data) => {
  const queryExecutor = client || db;
  const shouldManageTransaction = !client;
  const transactionClient = client || await db.connect();

  try {
    if (shouldManageTransaction) {
      await transactionClient.query('BEGIN');
    }

    const { customer_id, appointment_id, form_template_id } = data;

    if (!customer_id || !form_template_id) {
      throw new Error('Missing required fields: customer_id, form_template_id');
    }

    const customerRes = await transactionClient.query(
      `SELECT id FROM customers WHERE id = $1`,
      [customer_id]
    );

    if (!customerRes.rows[0]) {
      throw new Error(`Customer with id ${customer_id} does not exist`);
    }

    const templateRes = await transactionClient.query(
      `SELECT id, name, description FROM form_templates WHERE id = $1`,
      [form_template_id]
    );

    if (!templateRes.rows[0]) {
      throw new Error(`Form template with id ${form_template_id} does not exist`);
    }

    if (appointment_id) {
      const appointmentRes = await transactionClient.query(
        `SELECT id, customer_id FROM bookings WHERE id = $1`,
        [appointment_id]
      );

      if (!appointmentRes.rows[0]) {
        throw new Error(`Appointment with id ${appointment_id} does not exist`);
      }

      const booking = appointmentRes.rows[0];
      if (String(booking.customer_id) !== String(customer_id)) {
        throw new Error(`Booking ${appointment_id} does not belong to customer ${customer_id}`);
      }
    }

    const template = templateRes.rows[0];
    const createdFormRes = await transactionClient.query(
      `INSERT INTO completed_forms (
        customer_id,
        appointment_id,
        form_template_id,
        form_name,
        signature,
        signed_at,
        status,
        completed_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NULL, NULL, $5, NULL, NOW(), NOW())
       RETURNING *`,
      [customer_id, appointment_id || null, form_template_id, template.name, 'draft']
    );

    const completedForm = createdFormRes.rows[0];
    const questionsRes = await transactionClient.query(
      `SELECT * FROM form_questions
       WHERE form_template_id = $1
       ORDER BY sort_order ASC, id ASC`,
      [form_template_id]
    );

    for (const question of questionsRes.rows) {
      const questionInsertRes = await transactionClient.query(
        `INSERT INTO completed_form_questions (
          completed_form_id,
          original_question_id,
          question_text,
          question_type,
          required,
          sort_order,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [completedForm.id, question.id, question.question_text, question.question_type, question.required, question.sort_order]
      );

      const snapshotQuestion = questionInsertRes.rows[0];
      const optionsRes = await transactionClient.query(
        `SELECT * FROM form_question_options
         WHERE question_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [question.id]
      );

      for (const option of optionsRes.rows) {
        await transactionClient.query(
          `INSERT INTO completed_form_question_options (
            completed_form_question_id,
            original_option_id,
            option_label,
            sort_order,
            created_at
          ) VALUES ($1, $2, $3, $4, NOW())`,
          [snapshotQuestion.id, option.id, option.option_label, option.sort_order]
        );
      }
    }

    if (shouldManageTransaction) {
      await transactionClient.query('COMMIT');
    }

    return completedForm;
  } catch (error) {
    if (shouldManageTransaction) {
      await transactionClient.query('ROLLBACK');
    }
    throw error;
  } finally {
    if (shouldManageTransaction) {
      transactionClient.release();
    }
  }
};

export const updateCompletedFormStatus = async (client = null, id, status) => {
  const queryExecutor = client || db;

  if (!isValidStatus(status)) {
    throw new Error(`Invalid status. Allowed statuses: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const result = await queryExecutor.query(
    `UPDATE completed_forms
     SET status = $1::varchar,
         completed_at = CASE WHEN $1::varchar = 'completed' THEN NOW() ELSE completed_at END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

export const completeCompletedForm = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `UPDATE completed_forms
     SET status = 'completed',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

export const updateCompletedFormSignature = async (client = null, id, { signature, signed_at, status } = {}) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `UPDATE completed_forms
     SET signature = COALESCE($1, signature),
         signed_at = COALESCE($2, signed_at),
         status = COALESCE($3, status),
         completed_at = CASE WHEN $3::varchar IS NOT NULL AND $3::varchar = 'completed' THEN NOW() ELSE completed_at END,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [signature ?? null, signed_at ?? null, status ?? null, id]
  );

  return result.rows[0];
};

export const deleteCompletedForm = async (client = null, id) => {
  const queryExecutor = client || db;

  const result = await queryExecutor.query(
    `DELETE FROM completed_forms WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};
