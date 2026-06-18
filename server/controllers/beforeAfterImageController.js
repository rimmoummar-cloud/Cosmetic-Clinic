import BeforeAfterImageModel from "../models/beforeAfterImageModel.js";

export const getByServiceId = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const images = await BeforeAfterImageModel.getByServiceId(serviceId);

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const create =
  async (req, res) => {
    try {
      const before =
        req.files?.before_image?.[0];

      const after =
        req.files?.after_image?.[0];

      const item =
        await BeforeAfterImageModel.create(
          {
            service_id:
              req.body.service_id,

            title:
              req.body.title,

            description:
              req.body.description,

            display_order:
              req.body.display_order,

            before_image:
              before
                ? `/uploads/before-after/${before.filename}`
                : "",

            after_image:
              after
                ? `/uploads/before-after/${after.filename}`
                : "",
          }
        );

      res.json({
        success: true,
        data: item,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
      });
    }
  };

export const update =
  async (req, res) => {
    try {
      const old =
        await BeforeAfterImageModel.getById(
          req.params.id
        );

      const before =
        req.files?.before_image?.[0];

      const after =
        req.files?.after_image?.[0];

      const item =
        await BeforeAfterImageModel.update(
          req.params.id,
          {
            title:
              req.body.title,

            description:
              req.body.description,

            display_order:
              req.body.display_order,

            before_image:
              before
                ? `/uploads/before-after/${before.filename}`
                : old.before_image,

            after_image:
              after
                ? `/uploads/before-after/${after.filename}`
                : old.after_image,
          }
        );

      res.json({
        success: true,
        data: item,
      });
    } catch (err) {
      console.log(err);
    }
  };

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await BeforeAfterImageModel.delete(id);

    res.json({
      success: true,
      message: "Before/After image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};