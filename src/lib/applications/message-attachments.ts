export const applicationMessageAttachmentsBucket = "application-message-attachments"
export const applicationMessageAttachmentMaxBytes = 10 * 1024 * 1024
export const applicationMessageAttachmentMimeTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"] as const

export function isApplicationMessageAttachmentMimeType(value: string) {
  return applicationMessageAttachmentMimeTypes.some((type) => type === value)
}
