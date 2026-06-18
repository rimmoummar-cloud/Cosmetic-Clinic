"use client";

import { use, useEffect, useState } from "react";
import api from "../../../../../../../lib/api";
import { getMediaUrl } from "../../../../../../../lib/mediaUrl";

export default function Page({
  params,
}) {
  const { serviceId } = use(params);

  const [items, setItems] =
    useState([]);

  const [services, setServices] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [
    relatedServiceId,
    setRelatedServiceId,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================
  // FETCH RELATIONS
  // =====================

  const fetchItems = async () => {
    try {
      const res =
        await api.get(
          `/related-services/service/${serviceId}`
        );

      setItems(
        res.data.data || []
      );
    } catch (err) {
      console.log(err);
    }
  };

  // =====================
  // FETCH SERVICES
  // =====================

const fetchServices = async () => {
  try {
    const res = await api.get("/services");

    const filtered = (res.data || []).filter(
      (service) =>
        Number(service.id) !== Number(serviceId)
    );

    setServices(filtered);
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchItems();
    fetchServices();
  }, [serviceId]);

  // =====================
  // ADD
  // =====================

  const handleSave =
    async () => {
      if (!relatedServiceId)
        return;

      try {
        setLoading(true);

      await api.post(
  "/related-services",
  {
    service_id: Number(serviceId),
    related_service_id:
      Number(relatedServiceId),
  }
);

        await fetchItems();

        setShowModal(false);
        setRelatedServiceId("");
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  // =====================
  // DELETE
  // =====================

  const handleDelete =
    async (relatedId) => {
      const ok =
        window.confirm(
          "Delete this relation?"
        );

      if (!ok) return;

      try {
        await api.delete(
          `/related-services/${serviceId}/${relatedId}`
        );

        fetchItems();
      } catch (err) {
        console.log(err);
      }
    };

  return (
    <div className="p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1
            className="
            text-2xl
            font-bold
            text-[#8B6B4F]
          "
          >
            Related Services
          </h1>

          <p className="text-gray-500 text-sm">
            Manage related services
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="
            px-5
            py-2.5
            rounded-xl
            bg-[#8B6B4F]
            text-white
          "
        >
          + Add Service
        </button>

      </div>

      {/* TABLE */}

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-gray-100
          overflow-hidden
          shadow-sm
        "
      >
        <table className="w-full">

          <thead
            className="
            bg-[#FAF7F4]
          "
          >
            <tr>

              <th className="p-4 text-left">
                Image
              </th>

              <th className="p-4 text-left">
                Service
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {items.length ===
              0 && (
              <tr>
                <td
                  colSpan={3}
                  className="
                    p-8
                    text-center
                    text-gray-400
                  "
                >
                  No related services
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr
                key={
                  item.related_service_id
                }
                className="
                  border-t
                "
              >
                <td className="p-4">

                  {item.related_service_image ? (
                    <img
                      src={getMediaUrl(item.related_service_image)}
                      className="
                        w-16
                        h-16
                        rounded-xl
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-16
                        h-16
                        rounded-xl
                        bg-gray-100
                      "
                    />
                  )}

                </td>

                <td className="p-4 font-medium">
                  {
                    item.related_service_name
                  }
                </td>

                <td className="p-4">

                  <button
                    onClick={() =>
                      handleDelete(
                        item.related_service_id
                      )
                    }
                    className="
                      px-4
                      py-2
                      rounded-lg
                      bg-red-50
                      text-red-600
                    "
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            justify-center
            items-center
            z-50
          "
        >
          <div
            className="
              bg-white
              rounded-2xl
              p-6
              w-[500px]
            "
          >
            <h2
              className="
                text-xl
                font-bold
                mb-5
              "
            >
              Add Related Service
            </h2>

         <select
  value={relatedServiceId}
  onChange={(e) =>
    setRelatedServiceId(
      Number(e.target.value)
    )
  }
  className="
    w-full
    border
    rounded-xl
    p-3
    mb-6
  "
>
  <option value="">
    Select Service
  </option>

  {services.map((service) => (
    <option
      key={service.id}
      value={service.id}
    >
      {service.name}
    </option>
  ))}
</select>

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-gray-100
                "
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSave
                }
                disabled={
                  loading
                }
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-[#8B6B4F]
                  text-white
                "
              >
                {loading
                  ? "Saving..."
                  : "Save"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
