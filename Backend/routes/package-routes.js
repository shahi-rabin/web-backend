const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package-controller");
const { verifyUser } = require("../middlewares/auth");
const upload = require("../middlewares/uploads");

router
  .route("/")
  .get(packageController.getAllPackages)
  .post(verifyUser, packageController.createPackage)
  .put((req, res) => res.status(405).json({ error: "Method not allowed" }))
  .delete((req, res) => res.status(405).json({ error: "Method not allowed" }));

router.post(
  "/uploadPackageCover",
  verifyUser,
  upload,
  packageController.uploadPackageCover
);

// Get packages uploaded by others
router.get(
  "/others",
  verifyUser,
  packageController.getPackagesUploadedByOthers
);

// Get packages uploaded by current user
router.get(
  "/my-packages",
  verifyUser,
  packageController.getPackagesUploadedByCurrentUser
);

// Get all bookmarked packages
router.get("/bookmarked-packages", packageController.getAllBookmarkedPackages);

// Search packages
router.get("/search", packageController.searchPackages);

router
  .route("/:package_id")
  .get(packageController.getPackageById)
  .post((req, res) => {
    res.status(405).json({ error: "POST request is not allowed" });
  })
  .put(packageController.updatePackageById)
  .delete(packageController.deletePackageById);

// bookmark a package
router.post(
  "/bookmark/:package_id",
  verifyUser,
  packageController.bookmarkPackage
);

// Remove bookmark from a package
router.delete(
  "/bookmark/:package_id",
  verifyUser,
  packageController.removeBookmark
);

router.post(
  "/add-review/:package_id",
  verifyUser,
  packageController.addReviewToPackage
);

module.exports = router;
