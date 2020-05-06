const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");
const userController = require("../controllers/user");
const { check, validationResult } = require("express-validator");
const passwordController = require("../controllers/password.controller");
const jwtAuth = require("../middleware/auth");
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
router.get("/user", jwtAuth.authenticate, acl.authorize, (req, res, next) => {
  userController.IsUserAuthorized(req, res, next);
});

//Update controller is not proper will have to have a look before using it
router.put(
  "/user/update",
  jwtAuth.authenticate,
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
  jwtAuth.authenticate,
  acl.authorize,
  (req, res, next) => {
    userController.signOut(req, res, next);
  }
);

// Forgot password route
router.post("/user/forgot-password", acl.authorize, (req, res) => {
  passwordController.sendForgotPasswordMail(req, res);
});

// route to send reset forgotten password link
router.get("/user/reset", acl.authorize, (req, res) => {
  passwordController.resetPassword(req, res);
});

// to update user details
router.put("/user/update-user", acl.authorize, (req, res, next) => {
  userController.update(req, res, next);
});

// to update forgotton password
router.put("/user/forgot-password-update", acl.authorize, (req, res) => {
  passwordController.updateForgottenPassword(req, res);
});

// to get all users
router.get(
  "/user/all-users",
  jwtAuth.authenticate,
  acl.authorize,
  (req, res) => {
    userController.getAllUsers(req, res);
  }
);

// to get annotations done by one user
router.get("/annotations", jwtAuth.authenticate, acl.authorize, (req, res) => {
  annotationController.getAnnotationsByUsers(req, res);
});

// to update current image annotation and fetch new image
router.post(
  "/annotations/update-get-image-data-by-user",
  jwtAuth.authenticate,
  acl.authorize,
  async (req, res, next) => {
    await annotationController.updateImageData(req, res, next);
  }
);

// to get first image on the screen
router.get(
  "/annotations/get-image-data-by-user",
  jwtAuth.authenticate,
  acl.authorize,
  (req, res) => {
    annotationController.getImageDataByUser(req, res);
  }
);

// to get all the annotations of all the users by admin
router.get(
  "/admin/all-annotations",
  jwtAuth.authenticate,
  acl.authorize,
  (req, res, next) => {
    annotationController.getAnnotations(req, res, next);
  }
);

// to get changed fromat data
router.get(
  "/annotations/admin/all-annotations-csv",
  jwtAuth.authenticate,
  acl.authorize,
  (req, res, next) => {
    annotationController.changeFormatToCSVXML(req, res, next);
  }
);

// upload bulk images data in annotation table
router.post(
  "/annotations/admin/upload-dl-model-annotations",
  jwtAuth.authenticate,
  acl.authorize,
  (req, res) => {
    annotationController.createBulkAnnotationByDLModel(req, res);
  }
);

module.exports = router;
