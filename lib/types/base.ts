export type PhoneTag = "MOBILE" | "HOME" | "WORK"

export type Phone = {
  localNumber?: string
  isoCountryCode?: string
  isoNumber?: string
  tag?: PhoneTag
  permissionToSMS?: boolean
  verified?: boolean
  description?: string
}

export type EmailTag = "USERNAME"

export type Email = {
  address: string
  tag: EmailTag
  permissionToEmail?: boolean
  verified?: boolean
  description?: string
}

export type Address = {
  address: string
  isoCountryCode?: string
  state?: string
  city?: string
  postalCode?: string
}
