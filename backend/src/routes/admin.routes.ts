import { Router } from "express";
import { createStaffUser, listStaffUsers } from "../controllers/admin.controller";
import {
  homepageUploadErrorHandler,
  listHomepageSections,
  updateHomepageSection,
  uploadHomepageLogo,
  uploadHomepageMedia,
} from "../controllers/homepage.controller";
import {
  createTeamMember,
  deleteTeamMember,
  listTeamMembers,
  teamUploadErrorHandler,
  updateTeamMember,
} from "../controllers/team.controller";
import {
  getAdminSettings,
  settingsUploadErrorHandler,
  updateSiteSettings,
  uploadFavicon,
  uploadLoginLogo,
} from "../controllers/settings.controller";
import { getAnalyticsOverview } from "../controllers/tracking.controller";
import {
  createService,
  createServiceGroup,
  deleteService,
  deleteServiceGroup,
  listAdminServices,
  updateService,
  updateServiceGroup,
} from "../controllers/services.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  homepageLogoUpload,
  homepageMediaUpload,
  siteFaviconUpload,
  siteLoginLogoUpload,
  teamPhotoUpload,
} from "../middleware/upload";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listStaffUsers);
router.post("/users", createStaffUser);

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

router.get("/settings", getAdminSettings);
router.put("/settings", updateSiteSettings);
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

export default router;
