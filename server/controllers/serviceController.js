import * as Service from '../models/services.js';

export const getServices = async (req, res) => {
  try {
    const services = await Service.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveServices = async (req, res) => {
  try {
    const services = await Service.getActiveServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const getService = async (req, res) => {
  const service = await Service.getServiceById(req.params.id);
  res.json(service);
};



export const getServiceByCategory = async (req, res) => {
  const service = await Service.getServiceByCategoryId(req.params.id);
  res.json(service);
};


export const createService = async (req, res) => {
  const imageUrl = req.file
    ? `/uploads/services/${req.file.filename}`
    : req.body.image_url;

  const service = await Service.createService({
    ...req.body,
    image_url: imageUrl,
  });
  res.json(service);
};

export const updateService = async (req, res) => {
  const oldService = await Service.getServiceById(req.params.id);
  const hasImageUrl = Object.prototype.hasOwnProperty.call(
    req.body,
    "image_url"
  );
  const imageUrl = req.file
    ? `/uploads/services/${req.file.filename}`
    : hasImageUrl
      ? req.body.image_url
      : oldService?.image_url;

  const service = await Service.updateService(
    req.params.id,
    {
      ...req.body,
      image_url: imageUrl,
    }
  );
  res.json(service);
};

export const deleteService = async (req, res) => {
  await Service.deleteService(req.params.id);
  res.json({ message: "service deleted" });
};
