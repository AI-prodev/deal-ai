import express from "express"
import * as adminController from "../../controllers/adminController"
import { authenticate, hasRoles } from "../../middlewares/auth"
import {
    deleteAdminBusinessSeller,
    getAllAdminBusinessSellers,
    toggleBusinessSellerStatus
} from "../../controllers/sellerController"
import {
    getAllAdminCommercialSellers,
    deleteAdminCommercialSeller,
    toggleEnableCommercialSeller
} from "../../controllers/commercialSellerController"
import { paginateAndFilter } from "../../middlewares/paginateAndFilterMiddleware"
import UserModel from "../../models/user"
import { BusinessSellerModel } from "../../models/seller"
import { CommercialSellerModel } from "../../models/commercialSeller"
import lead from "../../models/lead"

const router = express.Router()

router.get(
    "/users",
    authenticate,
    paginateAndFilter(
        UserModel,
        undefined,
        "-store -apps -businessAddress -apiKey",
        true
    ),
    hasRoles(["admin"]),
    adminController.listUsers
)
router.get(
    "/users/csv",
    authenticate,
    hasRoles(["admin"]),
    adminController.listUsersCSV
)

router.post("/user", authenticate, hasRoles(["admin"]), adminController.addUser)
router.patch(
    "/user/suspend/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.suspendUser
)
router.patch(
    "/user/updateExpire/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.updateExpireUser
)
router.delete(
    "/user/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.deleteUser
)
router.put(
    "/user/roles/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.setUserRoles
)

router.post(
    "/user/addRole/:email",
    adminController.checkApiKey,
    adminController.addRole
)

router.post(
    "/user/suspend/:email/:shouldSuspend",
    adminController.checkApiKey,
    adminController.suspendUserByEmail
)
router.post(
    "/user/remove/:email",
    adminController.checkApiKey,
    adminController.deleteUserByEmail
)
router.post(
    "/user/removeRole/:email",
    adminController.checkApiKey,
    adminController.removeRole
)

router.post(
    "/user/exists/:email",
    adminController.checkApiKey,
    adminController.userExists
)

router.post(
    "/user/checkSubscription/:email",
    adminController.checkApiKey,
    adminController.checkSubscription
)

router.get(
    "/user/userPurchaseData/:email",
    adminController.checkApiKey,
    adminController.userPurchaseData
)

router.get(
    "/user/stripePortalUrls",
    authenticate,
    adminController.stripePortalUrls
)

router.put(
    "/user/reset-password/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.resetUserPassword
)
router.get(
    "/sell-business",
    authenticate,
    paginateAndFilter(
        BusinessSellerModel,
        {
            path: "userId",
            select: "firstName lastName email roles",
            from: "users"
        },
        "-vectors"
    ),
    hasRoles(["admin"]),
    getAllAdminBusinessSellers
)
router.put(
    "/sell-business/toggle/:id",
    authenticate,
    hasRoles(["admin"]),
    toggleBusinessSellerStatus
)
router.delete(
    "/sell-business/:id",
    authenticate,
    hasRoles(["admin"]),
    deleteAdminBusinessSeller
)

router.get(
    "/sell-property/",
    authenticate,
    hasRoles(["admin"]),
    paginateAndFilter(
        CommercialSellerModel,
        {
            path: "userId",
            select: "firstName lastName email roles",
            from: "users"
        },
        "-vectors"
    ),
    getAllAdminCommercialSellers
)

router.delete(
    "/sell-property/:id",
    authenticate,
    hasRoles(["admin"]),
    deleteAdminCommercialSeller
)

router.put(
    "/sell-property/toggle/:id",
    authenticate,
    hasRoles(["admin"]),
    toggleEnableCommercialSeller
)

router.post(
    "/users/prune",
    adminController.checkApiKey,
    adminController.pruneUsers
)

router.post(
    "/users/forceRoleUpdate/:email",
    adminController.checkApiKey,
    adminController.forceRoleUpdate
)

router.post(
    "/users/simulateRoleUpdate/:email",
    adminController.checkApiKey,
    adminController.simulateRoleUpdate
)

router.put("/lead", adminController.checkApiKey, adminController.putLead)

router.get(
    "/leads",
    authenticate,
    //   hasRoles(["admin", "leads", "leads-pro", "leads-max", "lite", "user"]),
    paginateAndFilter(lead),
    adminController.listLeads
)
router.delete(
    "/leads/:id",
    authenticate,
    hasRoles(["admin"]),
    adminController.removeLead
)

router.post(
    "/leads/report",
    authenticate,
    hasRoles(["admin", "leads", "leads-pro", "leads-max", "lite", "user"]),
    adminController.reportLead
)

export { router as adminRoutes }
