

export enum NotificationEvent {
    SEND_VERIFICATION_CODE_EMAIL ="SEND_VERIFICATION_CODE_EMAIL",
    SEND_VERIFICATION_CODE_PHONE ="SEND_VERIFICATION_CODE_PHONE",
    SEND_PASSWORD_RESET_CODE ="SEND_PASSWORD_RESET_CODE",

   
}

export enum EmailTemplateName {
    VerificationCode = "verification-code",
    PasswordResetCode = "password-code",
    KYCApproved = "kyc-approved",
    KYCRejected = "kyc-rejected",
    TourCompleted = "tour-completed",
    TourPaymentProcessed = "tour-payment-processed",
    TourCreated = "tour-created",
    AccountDeletionNotice = "account-deletion-notice",
    TourDraft = "tour-draft",
    TourDraftReminder = "tour-draft-reminder",
    TourApproved = "tour-approved",
    BookingConfirmationUser = "booking-confirmation-user",
    BookingConfirmationRecipient = "booking-confirmation-recipient",
    BookingConfirmationGuide = "booking-confirmation-guide",
    BookingReminder = "booking-reminder",
    NewBookingTourOwner = "new-booking-tour-owner",
    ResetCode = "reset-code",
    ContactSupport = "contact-support",
    FinanceBookingClosed = "finance-booking-closed",



  }
  
