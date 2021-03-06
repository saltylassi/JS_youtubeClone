import routes from "./routes";
import multer from "multer";

const multerVideo = multer({ dest: "uploads/videos/" });
const multerAvatar = multer({ dest: "uploads/avatars" });

export const localsMiddleware = (req, res, next) => {
    res.locals.siteName = "youtubeClone";
    res.locals.routes = routes;
    res.locals.loggedUser = req.user || null;
    // console.log(`on middleware, ${req.user}`);
    next();
};

export const onlyPublic = (req, res, next) => {
    if (req.user) {
        res.redirect(routes.home);
    } else {
        next();
    }
};

export const onlyPrivate = (req, res, next) => {
    if (!req.user) {
        res.redirect(routes.home);
    } else {
        next();
    }
};

export const uploadVideo = multerVideo.single("videoFile"); //한 번에 하나만

export const uploadAvatar = multerAvatar.single("avatar");
