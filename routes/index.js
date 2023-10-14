import express from 'express'
import indexController from '../controllers/indexController.js';

var router = express.Router();

/* GET home page. */
router.get("/", indexController.index);
router.get("/sign-in", indexController.sign_in_get)
router.post("/sign-in", indexController.sign_in_post)
router.get("/sign-up", indexController.sign_up_get)
router.post("/sign-up", indexController.sign_up_post)
router.get("/log-out", indexController.log_out)
router.get("/become-member", indexController.become_member_get)
router.post("/become-member", indexController.become_member_post)
router.get("/become-admin", indexController.become_admin_get)
router.post("/become-admin", indexController.become_admin_post)
router.get("/create-message", indexController.create_message_get)
router.post("/create-message", indexController.create_message_post)
router.get("/delete-message/:id", indexController.delete_message_get)
router.post("/delete-message/:id", indexController.delete_message_post)
export default router;
