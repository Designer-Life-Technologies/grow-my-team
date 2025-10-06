import z from "zod"

export const PhoneTagSchema = z.enum(["MOBILE", "HOME", "WORK"])
export type PhoneTag = z.infer<typeof PhoneTagSchema>

export const PhoneSchema = z.object({
  localNumber: z.string().nullable().describe("The local number of the phone."),
  isoCountryCode: z
    .string()
    .nullable()
    .describe("The ISO country code of the phone."),
  isoNumber: z.string().nullable().describe("The ISO number of the phone."),
  tag: PhoneTagSchema.nullable().describe("The tag of the phone."),
  permissionToSMS: z
    .boolean()
    .nullable()
    .describe("The permission to SMS the person."),
  verified: z
    .boolean()
    .nullable()
    .describe("The verification status of the phone."),
  description: z.string().nullable().describe("The description of the phone."),
})
export type Phone = z.infer<typeof PhoneSchema>

export const EmailTagSchema = z.enum(["USERNAME", "APPLICANT"])
export type EmailTag = z.infer<typeof EmailTagSchema>

export const EmailSchema = z.object({
  address: z
    .string()
    .describe("The email address in valid email address format."),
  tag: EmailTagSchema.describe("The tag of the email."),
  permissionToEmail: z
    .boolean()
    .nullable()
    .describe("The permission to email the person."),
  verified: z
    .boolean()
    .nullable()
    .describe("The verification status of the email."),
  description: z
    .string()
    .nullable()
    .describe("The description of the email address."),
})
export type Email = z.infer<typeof EmailSchema>

export type Address = {
  address: string
  isoCountryCode?: string
  state?: string
  city?: string
  postalCode?: string
}
