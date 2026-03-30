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
  const service = await Service.createService(req.body);
  res.json(service);
};

export const updateService = async (req, res) => {
  const service = await Service.updateService(
    req.params.id,
    req.body
  );
  res.json(service);
};

export const deleteService = async (req, res) => {
  await Service.deleteService(req.params.id);
  res.json({ message: "service deleted" });
};