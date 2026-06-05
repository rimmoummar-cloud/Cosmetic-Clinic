import pool from "../config/db.js";

export const createWaitingList = async ({
  customer_name,
  customer_email,
  customer_phone,
  requested_date,
  period,
  notes,
  services,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const waitingResult = await client.query(
      `
      INSERT INTO waiting_list (
        customer_name,
        customer_email,
        customer_phone,
        requested_date,
        period,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        customer_name,
        customer_email,
        customer_phone,
        requested_date,
        period,
        notes || null,
      ]
    );

    const waitingList = waitingResult.rows[0];

    for (const service of services) {
      await client.query(
        `
        INSERT INTO waiting_list_services (
          waiting_list_id,
          service_id,
          duration_minutes,
          price
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
          waitingList.id,
          service.id,
          service.duration_minutes,
          service.price,
        ]
      );
    }

    await client.query("COMMIT");

    return waitingList;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};



export const getAllWaitingList = async () => {
  const query = `
    SELECT
      wl.id,
      wl.customer_name,
      wl.customer_email,
      wl.customer_phone,
      wl.requested_date,
      wl.period,
      wl.status,
      wl.notes,
      wl.created_at,

      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'duration_minutes', wls.duration_minutes,
            'price', wls.price
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS services

    FROM waiting_list wl

    LEFT JOIN waiting_list_services wls
      ON wl.id = wls.waiting_list_id

    LEFT JOIN services s
      ON wls.service_id = s.id

    GROUP BY wl.id
    ORDER BY wl.created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};





export const approveWaitingList = async (id) => {
  const query = `
    UPDATE waiting_list
    SET status = 'accepted'
    WHERE id = $1
    RETURNING
      id,
      customer_name,
      customer_email,
      requested_date,
      period,
      status
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};



export const getMatchingWaitingList = async (
  requestedDate,
  period
) => {

  const result = await pool.query(
    `
    SELECT *
    FROM waiting_list
    WHERE requested_date = $1
      AND period = $2
      AND status != 'accepted'
    `,
    [
      requestedDate,
      period
    ]
  );

  return result.rows;
};


export const getWaitingListTotalDuration =
async (waitingListId) => {

  const result = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(duration_minutes),
        0
      ) AS total_duration
    FROM waiting_list_services
    WHERE waiting_list_id = $1
    `,
    [waitingListId]
  );

  return Number(
    result.rows[0].total_duration
  );
};