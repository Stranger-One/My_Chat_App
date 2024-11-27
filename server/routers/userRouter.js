import express from 'express';
import { registerUser, setVarificationOtp, varifyAccount, loginUser, setResetPasswordOtp, resetPassword, logoutUser, searchUsers, getUser, updateUser, authenticatedUserDetails } from '../controllers/userController.js';
import { checkAuthentication } from '../middlewares/checkIsAuthenticated.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/send-verification', setVarificationOtp)
router.post('/verify', varifyAccount)
router.post('/set-reset-password-otp', setResetPasswordOtp);
router.post('/reset-password', resetPassword)
router.post('/login', loginUser)
router.get('/check-auth', checkAuthentication, authenticatedUserDetails)
router.get('/logout', logoutUser)

router.get('/search-users', searchUsers)
router.get('/get-user', getUser)
router.post('/update-user', updateUser)


export default router;
