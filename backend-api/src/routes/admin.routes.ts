import { Router } from "express";
import {
  createStaffUser,
  deleteUserAccount,
  listClientUsers,
  listStaffUsers,
  updateUserAccount,
} from "../controllers/admin.controller.js";
import {
  homepageUploadErrorHandler,
  listHomepageSections,
  updateHomepageSection,
  uploadHomepageLogo,
  uploadHomepageMedia,
} from "../controllers/homepage.controller.js";
import {
  createTeamMember,
  deleteTeamMember,
  listTeamMembers,
  teamUploadErrorHandler,
  updateTeamMember,
} from "../controllers/team.controller.js";
import {
  getAdminSettings,
  settingsUploadErrorHandler,
  updateSiteSettings,
  uploadBrandLogo,
  uploadFavicon,
  uploadLoginLogo,
  uploadOgImage,
} from "../controllers/settings.controller.js";
import { getAnalyticsOverview } from "../controllers/tracking.controller.js";
import {
  getMailSettings,
  sendTestMail,
  updateMailSettings,
} from "../controllers/mail.controller.js";
import { mailTestLimiter } from "../middleware/rateLimit.js";
import {
  createService,
  createServiceGroup,
  deleteService,
  deleteServiceGroup,
  listAdminServices,
  updateService,
  updateServiceGroup,
} from "../controllers/services.controller.js";
import {
  createCareerJob,
  deleteCareerJob,
  getAdminCareersContent,
  reorderCareerJobs,
  updateCareerJob,
  updateCareersPage,
} from "../controllers/careersContent.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  homepageLogoUpload,
  homepageMediaUpload,
  siteBrandLogoUpload,
  siteFaviconUpload,
  siteLoginLogoUpload,
  siteOgImageUpload,
  teamPhotoUpload,
} from "../middleware/upload.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listStaffUsers);
router.post("/users", createStaffUser);
router.patch("/users/:id", updateUserAccount);
router.delete("/users/:id", deleteUserAccount);
router.get("/clients", listClientUsers);

router.get("/homepage", listHomepageSections);
router.post(
  "/homepage/logo",
  (req, res, next) => {
    homepageLogoUpload(req, res, (err) => {
      if (err) return homepageUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadHomepageLogo,
);
router.post(
  "/homepage/media",
  (req, res, next) => {
    homepageMediaUpload(req, res, (err) => {
      if (err) return homepageUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadHomepageMedia,
);
router.put("/homepage/:key", updateHomepageSection);

router.get("/team", listTeamMembers);
router.post(
  "/team",
  (req, res, next) => {
    teamPhotoUpload(req, res, (err) => {
      if (err) return teamUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  createTeamMember,
);
router.put(
  "/team/:id",
  (req, res, next) => {
    teamPhotoUpload(req, res, (err) => {
      if (err) return teamUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  updateTeamMember,
);
router.delete("/team/:id", deleteTeamMember);

router.get("/analytics/overview", getAnalyticsOverview);

router.get("/services", listAdminServices);
router.post("/services/groups", createServiceGroup);
router.put("/services/groups/:id", updateServiceGroup);
router.delete("/services/groups/:id", deleteServiceGroup);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/careers", getAdminCareersContent);
router.put("/careers/page", updateCareersPage);
router.post("/careers/jobs", createCareerJob);
router.put("/careers/jobs/order", reorderCareerJobs);
router.put("/careers/jobs/:id", updateCareerJob);
router.delete("/careers/jobs/:id", deleteCareerJob);

router.get("/settings", getAdminSettings);
router.put("/settings", updateSiteSettings);
router.get("/settings/mail", getMailSettings);
router.put("/settings/mail", updateMailSettings);
router.post("/settings/mail/test", mailTestLimiter, sendTestMail);
router.post(
  "/settings/favicon",
  (req, res, next) => {
    siteFaviconUpload(req, res, (err) => {
      if (err) return settingsUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadFavicon,
);
router.post(
  "/settings/login-logo",
  (req, res, next) => {
    siteLoginLogoUpload(req, res, (err) => {
      if (err) return settingsUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadLoginLogo,
);
router.post(
  "/settings/og-image",
  (req, res, next) => {
    siteOgImageUpload(req, res, (err) => {
      if (err) return settingsUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadOgImage,
);
router.post(
  "/settings/brand-logo",
  (req, res, next) => {
    siteBrandLogoUpload(req, res, (err) => {
      if (err) return settingsUploadErrorHandler(err, req, res, next);
      return next();
    });
  },
  uploadBrandLogo,
);

export default router;
