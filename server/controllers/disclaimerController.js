import * as DisclaimerModel from "../models/disclaimer.js";



export const getBookingDisclaimersToken =
  async (req, res) => {

    try {

const { token } = req.params;


const disclaimers =
  await DisclaimerModel.getDisclaimersByToken(
    token
  );




  
      res.json(disclaimers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error fetching disclaimers",
      });
    }
  };





export const getBookingDisclaimers =
  async (req, res) => {

    try {

      const { bookingId } = req.params;

      const disclaimers =
        await DisclaimerModel.getDisclaimersByBookingId(
          bookingId
        );

      res.json(disclaimers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error fetching disclaimers",
      });
    }
  };

export const createDisclaimer =
  async (req, res) => {

    try {

      const disclaimer =
        await DisclaimerModel.createDisclaimer(
          req.body
        );

      res.status(201).json(disclaimer);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error creating disclaimer",
      });
    }
  };

export const updateDisclaimer =
  async (req, res) => {

    try {

      const { id } = req.params;

      const updated =
        await DisclaimerModel.updateDisclaimer(
          id,
          req.body
        );

      if (!updated) {

        return res.status(404).json({
          message:
            "Disclaimer not found",
        });
      }

      res.json(updated);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error updating disclaimer",
      });
    }
  };

export const toggleDisclaimerStatus =
  async (req, res) => {

    try {

      const { id } = req.params;

      const { is_active } = req.body;

      const updated =
        await DisclaimerModel.toggleDisclaimerStatus(
          id,
          is_active
        );

      if (!updated) {

        return res.status(404).json({
          message:
            "Disclaimer not found",
        });
      }

      res.json(updated);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error updating status",
      });
    }
  };

export const getAllDisclaimers =
  async (req, res) => {

    try {

      const disclaimers =
        await DisclaimerModel.getAllDisclaimers();

      res.json(disclaimers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error fetching disclaimers",
      });
    }
  };

export const getDisclaimerById =
  async (req, res) => {

    try {

      const { id } = req.params;

      const disclaimer =
        await DisclaimerModel.getDisclaimerById(
          id
        );

      if (!disclaimer) {

        return res.status(404).json({
          message:
            "Disclaimer not found",
        });
      }

      res.json(disclaimer);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error fetching disclaimer",
      });
    }
  };



  export const deleteDisclaimer =
  async (req, res) => {

    try {

      const { id } = req.params;

      const deleted =
        await DisclaimerModel.deleteDisclaimer(
          id
        );

      if (!deleted) {

        return res.status(404).json({
          message: "Disclaimer not found",
        });

      }

      res.json({
        message:
          "Disclaimer deleted successfully",
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Error deleting disclaimer",
      });

    }

  };