const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");
const userController = require("../controllers/user");
const { check, validationResult } = require("express-validator");
const passwordController = require("../controllers/password.controller");
const auth = require("../middleware/auth");
const acl = require("express-acl");

// ACL config and inclusion

acl.config({ baseUrl: "/" });
acl.config({ decodedObjectName: "user" });

// Sign-up route to create a new user
router.post(
  "/user",
  [
    check("username").notEmpty(),
    check("email", "Invalid Email").isEmail().notEmpty(),
    check("mobile", "Invalid Phone number").notEmpty(),
    check("password", "Password must be atleast of 5 characters")
      .notEmpty()
      .isLength({ min: 5 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({ errors: errors.array() });
    }

    userController.create(req, res);
  }
);

//Login user
router.post("/user/login", (req, res, next) => {
  console.log("login");
  userController.userLogin(req, res, next);
});

// To verify if user is authorized
router.get("/user", auth.jwtAuthenticate, acl.authorize, (req, res, next) => {
  userController.IsUserAuthorized(req, res, next);
});

//Update controller is not proper will have to have a look before using it
router.put(
  "/user/update",
  auth.jwtAuthenticate,
  acl.authorize,
  (req, res, next) => {
    userController.update(req, res, next);
  }
);

// router.put("/update-password", (req, res, next) => {
//   passwordController.updatePassword(req, res, next);
// });

// User log-out
router.post(
  "/user/logout",
  auth.jwtAuthenticate,
  acl.authorize,
  (req, res, next) => {
    userController.signOut(req, res, next);
  }
);

// Forgot password route
router.post("/user/forgot-password", (req, res) => {
  passwordController.sendForgotPasswordMail(req, res);
});

// route to send reset forgotten password link
router.get("/user/reset", (req, res) => {
  passwordController.resetPassword(req, res);
});

// to update user details
router.put("/user/update-user", acl.authorize, (req, res, next) => {
  userController.update(req, res, next);
});

// to update forgotton password
router.put("/user/forgot-password-update", (req, res) => {
  passwordController.updateForgottenPassword(req, res);
});

// to get all users
router.get("/user/all-users", (req, res) => {
  userController.getAllUsers(req, res);
});

// to get annotations done by one user
router.get("/annotations", auth.jwtAuthenticate, acl.authorize, (req, res) => {
  annotationController.getAnnotationsByUsers(req, res);
});

// to update current image annotation and fetch new image
router.post(
  "/annotations/update-get-image-data-by-user",
  auth.jwtAuthenticate,
  acl.authorize,
  async (req, res, next) => {
    await annotationController.updateImageData(req, res, next);
  }
);

// to get first image on the screen
router.get(
  "/annotations/get-image-data-by-user",
  auth.jwtAuthenticate,
  acl.authorize,
  (req, res) => {
    annotationController.getImageDataByUser(req, res);
  }
);

// to get all the annotations of all the users by admin
router.get(
  "/admin/all-annotations",
  auth.basicAuth,
  acl.authorize,
  (req, res, next) => {
    annotationController.getAnnotations(req, res, next);
  }
);

router.get(
  "/admin/all-annotations/project",
  auth.basicAuth,
  acl.authorize,
  (req, res, next) => {
    annotationController.getAnnotationsByProjectIdName(req, res);
  }
);

router.get(
  "/admin/all-annotations/user",
  auth.basicAuth,
  acl.authorize,
  (req, res, next) => {
    annotationController.getAnnotationsByUserIdName(req, res);
  }
);

// to get changed fromat data
router.get(
  "/admin/all-annotations-csv",
  auth.basicAuth,
  acl.authorize,
  (req, res, next) => {
    annotationController.changeFormatToCSVXML(req, res, next);
  }
);

// upload bulk images data in annotation table
router.post("/admin/upload-dl-model-annotations", (req, res) => {
  annotationController.createBulkAnnotationByDLModel(req, res);
});

module.exports = router;
