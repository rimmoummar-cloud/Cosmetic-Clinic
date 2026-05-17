import db from "../config/db.js";

import * as AcceptanceModel
from "../models/acceptance.js";

export const acceptDisclaimers =
  async (req, res) => {

    const client = await db.connect();

    try {

      await client.query("BEGIN");

      const { bookingId } = req.params;

      const { disclaimerIds } = req.body;

      if (
        !Array.isArray(disclaimerIds)
      ) {
        return res.status(400).json({
          message:
            "disclaimerIds must be array",
        });
      }

      for (const id of disclaimerIds) {

        await AcceptanceModel.saveAcceptance(
          client,
          bookingId,
          id
        );
      }

      await client.query(
        `
        UPDATE bookings
        SET status = 'confirmed'
        WHERE id = $1
        `,
        [bookingId]
      );

      await client.query("COMMIT");

      res.json({
        message:
          "Disclaimers accepted successfully",
      });

    } catch (error) {

      await client.query("ROLLBACK");

      console.error(error);

      res.status(500).json({
        message:
          "Error accepting disclaimers",
      });

    } finally {
      client.release();
    }
  };