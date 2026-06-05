import * as model from "../models/watinglist.js";

import {
  sendWaitingListApprovedEmail,
} from "../utils/sendEmail.js";

export const createWaitingList = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      requested_date,
      period,
      notes,
      services,
    } = req.body;

    if (
      !customer_name ||
      !customer_phone ||
      !requested_date ||
      !period
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (
      !services ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      return res.status(400).json({
        message: "At least one service is required",
      });
    }

    const waitingList =
      await model.createWaitingList({
        customer_name,
        customer_email,
        customer_phone,
        requested_date,
        period,
        notes,
        services,
      });

    res.status(201).json(waitingList);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create waiting list request",
    });
  }
};

export const getWaitingList = async (req, res) => {
  try {
    const waitingList = await model.getAllWaitingList();

    res.status(200).json(waitingList);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch waiting list",
    });
  }
};






export const approveWaitingListController =
  async (req, res) => {

    try {

      const { id } = req.params;

      const waiting =
        await model.approveWaitingList(id);

      if (!waiting) {
        return res.status(404).json({
          message: "Waiting list request not found",
        });
      }

      await sendWaitingListApprovedEmail({
        to: waiting.customer_email,
        customerName:
          waiting.customer_name,
      });

      return res.status(200).json({
        message:
          "Waiting list approved successfully",
        data: waiting,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message,
      });

    }
  };