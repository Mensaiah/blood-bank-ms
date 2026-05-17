import { FileType } from "../../enum/File";




export const COLLECTION_NAMES = {
    USERS: "Users",
    DONORS: "Donors",
    BLOOD_UNITS: "BloodUnits",
    AUTHS: "Auths",
    NOTIFICATIONS: "notifications",
    FILES: 'files',
    THIRD_PARTY_API_CALLS: '_ThirdPartyAPICalls',
    ACTIVITY_LOGS: "activity_logs",
    SETTINGS: 'settings',
}

// Expanded MIME type mapping
export const MIMETOFILETYPE: { [key: string]: FileType } = {
    // Images
    'image/jpeg': FileType.IMAGE,
    'image/jpg': FileType.IMAGE,
    'image/png': FileType.IMAGE,
    'image/gif': FileType.IMAGE,
    'image/bmp': FileType.IMAGE,
    'image/webp': FileType.IMAGE,
    'image/tiff': FileType.IMAGE,
    'image/svg+xml': FileType.IMAGE,
    'image/x-icon': FileType.IMAGE,

    // Videos
    'video/mp4': FileType.VIDEO,
    'video/mpeg': FileType.VIDEO,
    'video/x-msvideo': FileType.VIDEO,  // AVI
    'video/x-ms-wmv': FileType.VIDEO,   // WMV
    'video/quicktime': FileType.VIDEO,  // MOV
    'video/x-flv': FileType.VIDEO,      // FLV
    'video/webm': FileType.VIDEO,
    'video/3gpp': FileType.VIDEO,
    'video/ogg': FileType.VIDEO,

    // Audio
    'audio/mpeg': FileType.AUDIO,
    'audio/wav': FileType.AUDIO,
    'audio/x-wav': FileType.AUDIO,
    'audio/aac': FileType.AUDIO,
    'audio/ogg': FileType.AUDIO,
    'audio/flac': FileType.AUDIO,
    'audio/x-flac': FileType.AUDIO,
    'audio/mp4': FileType.AUDIO,
    'audio/webm': FileType.AUDIO,
    'audio/x-ms-wma': FileType.AUDIO,

    // Documents
    'application/pdf': FileType.DOCUMENT,
    'application/msword': FileType.DOCUMENT, // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCUMENT, // DOCX
    'application/vnd.ms-excel': FileType.DOCUMENT, // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.DOCUMENT, // XLSX
    'application/vnd.ms-powerpoint': FileType.DOCUMENT, // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileType.DOCUMENT, // PPTX
    'application/rtf': FileType.DOCUMENT, // RTF
    'application/json': FileType.DOCUMENT,
    'text/plain': FileType.DOCUMENT,
    'text/csv': FileType.DOCUMENT,
    'application/zip': FileType.DOCUMENT,
    'application/x-tar': FileType.DOCUMENT,
    'application/x-rar-compressed': FileType.DOCUMENT, // RAR
};


export default {

    COLLECTION_NAMES,
};
