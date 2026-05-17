



export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED'
}




export enum UserType {
    USER = 'USER',
    ADMIN = 'ADMIN',
    HOSPITAL_REP = 'HOSPITAL_REP',
    LAB_REP = 'LAB_REP',
    
   
}

export enum AddressStatus {
    ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}



export enum UserGender {
    MALE = 'Male',
    FEMALE = 'Female'

}



export enum UserGroup {
    ALL = 'ALL',
    ANDROID = 'ANDROID',
    IOS = 'IOS',
    WEB = 'WEB',
    CUSTOM = 'CUSTOM',

}


export enum SupportedKYCDocument {
    NATIONAL_ID = 'NATIONAL_ID',
    BUSINESS_INFORMATION = 'BUSINESS_INFORMATION',
    FACE_ID = 'FACE_ID',
    ADDRESS = 'ADDRESS',

}


export enum VerificationEvent {
    SAVE_DOCUMENT = "SAVE_DOCUMENT",
    VERIFICATION_ID_REJECTED = 'VERIFICATION_ID_REJECTED',
    VERIFICATION_ID_APPROVED = 'VERIFICATION_ID_APPROVED'
    
}


export enum UserEvent {
    USER_REGISTERED = 'USER_REGISTERED',
    NEW_RATING = 'NEW_RATING'
}
export enum UserVerificationEvent {
    ADDRESS_UPDATED = "ADDRESS_UPDATED",
    ADDRESS_INFO_UPDATED = "ADDRESS_INFO_UPDATED",
}
