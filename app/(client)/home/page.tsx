"use client"

import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    Tabs,
    Tab,
    ToggleButtonGroup,
    ToggleButton,
    InputAdornment,
} from "@mui/material"
import {
    Close,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    StrikethroughS,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
    PhotoCamera,
    Videocam,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    CloudUpload,
    Settings,
} from "@mui/icons-material"
import Image from "next/image"
import dynamic from 'next/dynamic';
import apiUpload from '../../../services/action.services';
import { toast } from 'react-toastify';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export default function UltrasoundInterface() {
    const [tab, setTab] = useState(0);
    const [editorContent, setEditorContent] = useState("") // react-quill editor

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [resolution, setResolution] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });

    const videoRef = useRef<HTMLVideoElement>(null);


    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [recordedVideos, setRecordedVideos] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const [speechText, setSpeechText] = useState("");
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);

    const [selectedVoice, setSelectedVoice] = useState("vi-VN-Wavenet-C");

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
            const videoInputs = mediaDevices.filter(device => device.kind === "videoinput");
            setDevices(videoInputs);
            if (videoInputs.length > 0) {
                setSelectedDeviceId(videoInputs[0].deviceId);
            }
        });
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (isCameraOn && cameraStream && video) {
            video.srcObject = cameraStream;
            video.play().catch((e) => {
                console.error("Lỗi khi gọi video.play():", e);
            });
        }
        return () => {
            cameraStream?.getTracks().forEach(track => track.stop());
        };
    }, [cameraStream, isCameraOn]);

    // Quill editor modules and formats
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["clean"],
        ],
    }

    const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "align"]

    // bật camera
    const handleCameraClick = async () => {
        if (isCameraOn) {
            // Tắt camera nếu đang bật
            cameraStream?.getTracks().forEach(track => track.stop());
            setCameraStream(null);
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: selectedDeviceId,
                        width: { ideal: resolution.width },
                        height: { ideal: resolution.height },
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 44100,
                    },
                    // audio: true,
                });
                setCameraStream(stream);
                setIsCameraOn(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Không thể truy cập camera", error);
                alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
            }
        }
    };

    // chụp ảnh 
    const handleCaptureImage = () => {
        if (!videoRef.current) {
            toast.warning("Vui lòng bật Camera!")
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            // const dataUrl = canvas.toDataURL("image/jpg");
            // setCapturedImages((prev) => [dataUrl, ...prev]);

            // Convert to blob
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                // Tạo file giả để upload
                const file = new File([blob], `screenshot_${Date.now()}.jpg`, {
                    type: "image/jpeg",
                });

                // Gửi form-data giống như hình bạn gửi
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", "CERTIFICATE");

                try {
                    const response = await apiUpload.postUploadFile(formData); // bạn đã có hàm này
                    console.log('response : ', response);

                    const imageUrl = response; // đường link hình trả về từ API

                    // Gắn vào mảng hình đã upload
                    setCapturedImages((prev) => [imageUrl, ...prev]);
                } catch (err) {
                    console.error("Lỗi upload ảnh:", err);
                    alert("Không thể upload ảnh. Vui lòng thử lại.");
                }
            }, "image/jpeg", 0.95); // chất lượng 95%
        }
    };

    // quay video
    const handleRecordVideo = () => {
        if (!videoRef.current) {
            toast.warning("Vui lòng bật Camera!")
            return;
        }

        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else if (cameraStream) {
            recordedChunksRef.current = [];
            // const recorder = new MediaRecorder(cameraStream, { mimeType: "video/mp4" });
            const recorder = new MediaRecorder(cameraStream); // để browser tự chọn
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });

                const file = new File([blob], `video_${Date.now()}.webm`, { type: "video/webm" });
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", "CERTIFICATE");

                try {
                    const response = await apiUpload.postUploadFile(formData); // bạn đã có hàm này
                    console.log('response : ', response);

                    const imageUrl = response; // đường link hình trả về từ API

                    // Tính thời lượng video
                    const tempVideo = document.createElement("video");
                    tempVideo.src = imageUrl;
                    tempVideo.onloadedmetadata = () => {
                        setRecordedVideos(prev => [imageUrl, ...prev]);
                    };
                } catch (err) {
                    console.error("Lỗi upload ảnh:", err);
                    alert("Không thể upload ảnh. Vui lòng thử lại.");
                }

            };

            recorder.start();
            setIsRecording(true);
        }
    };

    // handle download
    const forceDownload = async (url: string, filename: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    };

    // text to
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Trình duyệt không hỗ trợ");
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "vi-VN";
        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                finalTranscript += event.results[i][0].transcript;
            }
            setSpeechText(finalTranscript);
        };
        recognition.onerror = console.error;
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const speakText = async () => {
        const token = process.env.NEXT_PUBLIC_GOOGLE_TTS_TOKEN; // cần thay bằng token thực tế được cấp
        const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                input: { text: speechText },
                voice: { languageCode: "vi-VN", name: `${selectedVoice}` },
                audioConfig: { audioEncoding: "MP3" }
            })
        });
        const result = await response.json();
        const audio = new Audio("data:audio/mp3;base64," + result.audioContent);
        audio.play();
    };

    const speakTextNoApi = () => {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "vi-VN";
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="flex flex-col items-center  min-h-screen w-full pt-2">

            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="🎥 Quay video" />
                <Tab label="🗣️ Chuyển giọng nói" />
            </Tabs>

            {
                tab === 0 &&
                <div className='px-10 pb-10  w-full h-full space-y-2'>
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full bg-white dropshaw">
                        <Typography className='md:col-span-2 col-span-1 flex items-center h-14'>
                            <p className='text-2xl font-bold'>
                                Chức năng video
                            </p>
                        </Typography>

                        {/* Left Column */}
                        <Box className="flex flex-col gap-4">
                            {/* Camera Device Dropdown */}
                            <FormControl fullWidth className="bg-white">
                                <InputLabel>Chọn Camera</InputLabel>
                                <Select
                                    value={selectedDeviceId}
                                    label="Chọn Camera"
                                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                                >
                                    {devices.map((device) => (
                                        <MenuItem key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Resolution Dropdown */}
                            <FormControl fullWidth className="bg-white">
                                <InputLabel>Độ phân giải</InputLabel>
                                <Select
                                    value={`${resolution.width}x${resolution.height}`}
                                    label="Độ phân giải"
                                    onChange={(e) => {
                                        const [w, h] = e.target.value.split("x").map(Number);
                                        setResolution({ width: w, height: h });
                                    }}
                                >
                                    <MenuItem value="640x480">640 x 480</MenuItem>
                                    <MenuItem value="1280x720">1280 x 720</MenuItem>
                                    <MenuItem value="1920x1080">1920 x 1080</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Camera Toggle Button */}
                            <Button
                                variant="contained"
                                startIcon={<Settings />}
                                className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-fit"
                                onClick={handleCameraClick}
                            >
                                {isCameraOn ? "Tắt Camera" : "Chọn Camera"}
                            </Button>

                            <TextField label="Barcode" variant="outlined" fullWidth className="bg-white" />

                            <TextField label="Tên khách hàng" variant="outlined" fullWidth className="bg-white" />

                            <Box className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Ngày sinh"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end">
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="bg-white"
                                />

                                <FormControl fullWidth className="bg-white">
                                    <InputLabel>Giới tính</InputLabel>
                                    <Select value="nam" label="Giới tính">
                                        <MenuItem value="nam">Nam</MenuItem>
                                        <MenuItem value="nu">Nữ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="contained"
                                    startIcon={<Videocam />}
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={handleRecordVideo}
                                >
                                    {isRecording ? "Dừng Quay" : "Quay Video"}
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<PhotoCamera />}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={handleCaptureImage}
                                >
                                    Chụp Ảnh
                                </Button>
                            </Box>

                            <Paper elevation={1} className="relative aspect-video bg-black w-full">
                                {
                                    isCameraOn ?
                                        (
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                        )
                                        :
                                        (
                                            <Image
                                                src={"/default/default.png"}
                                                alt="Ultrasound Image"
                                                fill
                                                className="object-cover"
                                            />
                                        )
                                }
                            </Paper>
                        </Box>

                        {/* Right Column */}
                        <Box className="flex flex-col gap-4">
                            {/* React Quill Editor */}
                            <Box className="flex flex-col gap-2">
                                <Box className="border rounded-md bg-white overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={editorContent}
                                        onChange={setEditorContent}
                                        modules={modules}
                                        formats={formats}
                                        className="h-[300px]"
                                    />
                                </Box>
                            </Box>

                            <TextField label="Kết luận" multiline rows={4} variant="outlined" fullWidth className="bg-white" />

                            <Box className="flex justify-between mt-4">
                                <Button variant="outlined" startIcon={<CloudUpload />} className="text-blue-600 border-blue-600">
                                    Tải Ảnh Lên
                                </Button>
                                <Button variant="contained" className="bg-blue-600 hover:bg-blue-700">
                                    Lưu Kết Quả
                                </Button>
                            </Box>
                        </Box>

                        {/* Image select or video  */}
                        <Box className="md:col-span-2 col-span-1 flex items-center justify-between mt-2">
                            <IconButton>
                                <KeyboardArrowLeft />
                            </IconButton>
                            <Box className="flex gap-2 overflow-x-auto py-2">
                                {/* Hình ảnh đã chụp */}
                                {capturedImages.map((img, index) => (
                                    <Box key={`img-${index}`} className="relative w-52 h-36 flex-shrink-0 border rounded overflow-hidden">
                                        <img src={img} alt={`Captured ${index}`} className="object-cover w-full h-full" />
                                        <Box className="absolute top-1 left-1 flex gap-1">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    if (img) forceDownload(img, `image-${index}.jpg`);
                                                }}
                                            >
                                                <CloudUpload fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== index))}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}

                                {/* Video đã quay */}
                                {recordedVideos.map((vid, index) => (
                                    <Box key={`vid-${index}`} className="relative w-52 h-36 flex-shrink-0 border rounded overflow-hidden">
                                        <video src={vid} controls className="object-cover w-full h-full" />

                                        <Box className="absolute top-1 left-1 flex gap-1">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    if (vid) forceDownload(vid, `video-${index}.mp4`);
                                                }}
                                            >
                                                <CloudUpload fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => setRecordedVideos(prev => prev.filter((_, i) => i !== index))}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <IconButton>
                                <KeyboardArrowRight />
                            </IconButton>
                        </Box>
                    </Box>
                </div>
            }
            {tab === 1 && (
                <Box className="space-y-4 mt-4">
                    <Typography className="font-bold">🎤 Speech to Text</Typography>
                    <FormControl fullWidth className="bg-white">
                        <InputLabel>Chọn Giọng Đọc</InputLabel>
                        <Select
                            value={selectedVoice}
                            label="Chọn Giọng Đọc"
                            onChange={(e) => setSelectedVoice(e.target.value)}
                        >
                            <MenuItem value="vi-VN-Wavenet-C">Giọng Nữ (C)</MenuItem>
                            <MenuItem value="vi-VN-Wavenet-D">Giọng Nam (D)</MenuItem>
                        </Select>
                    </FormControl>
                    <Button onClick={isListening ? stopListening : startListening} variant="contained">
                        {isListening ? "🛑 Dừng" : "🎙️ Ghi âm"}
                    </Button>
                    <Box className="p-2 border bg-gray-100 min-h-[80px] whitespace-pre-wrap">{speechText}</Box>
                    <Typography className="font-bold">📢 Text to Speech</Typography>
                    <TextField
                        multiline
                        minRows={3}
                        fullWidth
                        value={speechText}
                        onChange={(e) => setSpeechText(e.target.value)}
                    />
                    <div className='flex items-center gap-2'>
                        <Button onClick={speakText} variant="contained" color="success">
                            🔊 Đọc văn bản có API
                        </Button>
                        <Button onClick={speakTextNoApi} variant="contained" color="success">
                            🔊 Đọc văn bản Không API
                        </Button>
                    </div>
                </Box>
            )}
        </div>
    )
}
