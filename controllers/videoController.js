import routes from "../routes";
import Video from "../models/Video";

export const home = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({ _id: -1 }); //조건X -> 전부 로드
        res.render("home", { pageTitle: "home", videos }); //render는 서버의 pug파일을 출력, views폴더에서 동일한 이름을 가진 파일을 찾는다
    } catch (error) {
        console.log(error);
        res.render("home", { pageTitle: "home", videos: [] });
    }
};

export const search = async (req, res) => {
    const {
        query: { term: searchingBy },
    } = req; //ES6, destructuring

    let videos = [];

    try {
        videos = await Video.find({ title: { $regex: searchingBy, $options: "i" } });
    } catch (error) {
        console.log(error);
    }

    res.render("search", { pageTitle: "search", searchingBy, videos }); //searchingBy는 searchingBy:searchingBy와 동일 (ES6)
};

export const getUpload = (req, res) => {
    res.render("upload", { pageTitle: "upload" });
};

export const postUpload = async (req, res) => {
    const {
        body: { title, description },
        file: { path },
        user,
    } = req;

    const newVideo = await Video.create({
        fileUrl: path,
        title: title,
        description: description,
        creator: user.id,
    });

    user.videos.push(newVideo.id);
    user.save();

    res.redirect(routes.videoDetail(newVideo.id));
};

export const videoDetail = async (req, res) => {
    const {
        params: { id },
    } = req;

    try {
        const video = await Video.findById(id).populate("creator"); //populate는 objID에 사용, id로 해당 객체를 참조
        res.render("videoDetail", { pageTitle: "Video Detail", video });
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
    }
};

export const getEditVideo = async (req, res) => {
    const {
        params: { id },
    } = req;

    try {
        const video = await Video.findById(id).populate("creator");
        if (video.creator.id != req.user.id) {
            throw Error();
        } else {
            res.render("editVideo", { pageTitle: "Edit Video", video });
        }
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
    }
};

export const postEditVideo = async (req, res) => {
    const {
        params: { id },
        body: { title, description },
    } = req;

    try {
        await Video.findOneAndUpdate(
            { _id: id },
            {
                title,
                description,
            }
        );
        res.redirect(routes.videoDetail(id));
    } catch (error) {
        console.log(error);
    }
};

export const deleteVideo = async (req, res) => {
    const {
        params: { id },
    } = req;

    try {
        const video = await Video.findById(id).populate("creator");
        if (video.creator.id !== req.user.id) {
            throw Error();
        } else {
            await Video.findOneAndRemove(id);
        }
    } catch (error) {
        console.log(error);
    } finally {
        res.redirect(routes.home);
    }
};
