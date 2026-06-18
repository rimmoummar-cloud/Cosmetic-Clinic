import DashboardModel
from "../models/dashboardModel.js";

export const getDashboardStats =
async (req, res) => {
try {
const data =
await DashboardModel.getStats();


res.json({
  success: true,
  data,
});


} catch (err) {
console.log(err);


res.status(500).json({
  success: false,
  message:
    "Failed to load dashboard",
});


}
};
