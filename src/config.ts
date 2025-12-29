export const PORT = process.env.PORT ?? "3000";
export const DEFAULT_OTP_LENGTH = 6;
export const WORD_SEPARATOR = "-";
export const RATE_LIMIT_DEFAULT_TTL = 3600; // 1 hour in seconds
export const RATE_LIMIT_DEFAULT_LIMIT = 5e3; // 5k requests per hour
export const RATE_LIMIT_KEY = "ratelimit";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PROD_ENV = process.env.NODE_ENV === "production";
export const SECRET_1 = process.env.SECRET_1 ?? "53Cu7eS3kr3Et";
export const SECRET_2 = process.env.SECRET_2 ?? "sEkU7E53Kr33t";
export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? "3600"; // 1h in seconds
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL ?? "604800"; // 7d in seconds
export const POSTGRES_URL = process.env.POSTGRES_URL ?? "localhost:5432/fmb";
export const VALKEY_URL = process.env.VALKEY_URL ?? "redis://localhost:6379";
export const OTP_TTL = 60 * 15 // 15m in seconds
export const REGISTER_CACHE_KEY = "register"
export const REFRESH_TOKEN_CACHE_KEY = "refresh-token"
export const MFA_OTP_CACHE_KEY = "mfa-otp"
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Bun <bun@ethereal.email>"
export const IMAGE_UPLOAD = {
    maxSize: process.env.IMAGE_MAX_SIZE ?? "5m",
    mimeType: ["image/jpeg", "image/jpg", "image/png"]
}
export const DOJAH = {
    appId: process.env.DOJAH_APPID,
    secret: process.env.DOJAH_SECRET,
    url: "https://api.dojah.io",
    ip: "20.112.64.208",
    sandbox: {
        url: "https://sandbox.dojah.io",
        bvn: "22222222222",
        nin: "70123456789",
        /** Voters Identification Number */
        vin: "91F6B1F5BE29535558655586",
        phone: "09011111111",
        accountNumber: "3046507407",
        bankCode: "011",
    }
}
export const STORAGE = {
    bucket: process.env.STORAGE_BUCKET,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    defaultRegion: process.env.STORAGE_DEFAULT_REGION,
    endpointUrl: process.env.STORAGE_ENDPOINT_URL,
    addressProofPath: process.env.STORAGE_BUCKET_ADDRESS_PROOF,
    utilityBillPath: process.env.STORAGE_BUCKET_UTILITY_BILL,
    liveSelfiePath: process.env.STORAGE_BUCKET_LIVE_SELFIE,
    passportPhotoPath: process.env.STORAGE_BUCKET_PASSPORT_PHOTO,
    govtIdPath: process.env.STORAGE_BUCKET_GOVT_ID
}

export const CACHE_GET = {
    ttl: 10 as const, // 10s
    header: "x-cache",
}
export const tier1Limit = {
    description: "Tier 1 - Low Value",
    singleDeposit: 5e6,
    dailyDebit: 5e6,
    balance: 3e7,
    currency: "NGN"
}
export const tier2Limit = {
    description: "Tier 2 - Medium Value",
    singleDeposit: 1e7,
    dailyDebit: 2e7,
    balance: 5e7,
    currency: "NGN"
}
export const tier3Limit = {
    description: "Tier 3 - High Value",
    singleDeposit: 5e8,
    dailyDebit: 1e9,
    balance: Number.MAX_SAFE_INTEGER,
    currency: "NGN"
}

export const DOJAH_NIN_LOOKUP_RESPONSE_MOCK_DATA = {
    entity: {
        first_name: "John",
        last_name: "Doe",
        gender: "Male",
        middle_name: "",
        photo: "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgc...",
        date_of_birth: "1982-01-01",
        email: "abc@gmail.com",
        phone_number: "08012345678",
        employment_status: "unemployment",
        marital_status: "Single"
    }
}
export const DOJAH_BVN_VALIDATION_RESPONSE_MOCK_DATA = {
    entity: {
        bvn: {
            value: "22222222222",
            status: true
        },
        first_name: {
            confidence_value: 100,
            status: true
        },
        last_name: {
            confidence_value: 100,
            status: true
        }
    }
}
export const DOJAH_VIN_LOOKUP_RESPONSE_MOCK_DATA = {
    entity: {
        full_name: "JOHN DOE",
        voter_identification_number: "91F1234567890123",
        gender: "Male",
        occupation: "STUDENT",
        time_of_registration: "2011-02-18 13:59:46",
        state: "ONDO",
        local_government: "IDANRE",
        registration_area_ward: "",
        polling_unit: "OJAJIGBOKIN, O/S IN FRONT OF ABANA I & II",
        polling_unit_code: "12/03/04/005",
        address: "NO 16 OWODE QTS KABBA",
        phone: "0812345678",
        date_of_birth: "1960-10-16"
    }
}
export const DOJAH_UTILITY_BILL_VERIFY_RESPONSE_MOCK_DATA = {
    entity: {
        result: {
            status: "success",
            message: ""
        },
        identity_info: {
            full_name: "JOHN DOE",
            meter_number: "SBX12345678"
        },
        address_info: {
            street: "123 Sandbox Street SBX001",
            city: "Testville",
            state: "SB",
            country: "Sandbox Country"
        },
        provider_name: "Sandbox Power Company",
        bill_issue_date: "2025-01-15",
        amount_paid: "100",
        metadata: {
            extraction_date: "2025-08-15T00:00:00.000Z",
            is_recent: true
        }
    }
}
export const DOJAH_LIVENESS_CHECK_RESPONSE_MOCK_DATA = {
    entity: {
        liveness: {
            liveness_check: false,
            liveness_probability: 0.014614949759561568
        },
        face: {
            face_detected: true,
            message: "face detected",
            multiface_detected: false,
            details: {
                age_range: {
                    low: 25,
                    high: 35
                },
                smile: {
                    value: false,
                    confidence: 92.67727661132812
                },
                gender: {
                    value: "Female",
                    confidence: 99.92608642578125
                },
                eyeglasses: {
                    value: false,
                    confidence: 96.146484375
                },
                sunglasses: {
                    value: false,
                    confidence: 99.99609375
                },
                beard: {
                    value: false,
                    confidence: 85.18626403808594
                },
                mustache: {
                    value: false,
                    confidence: 96.13561248779297
                },
                eyes_open: {
                    value: true,
                    confidence: 88.61351776123047
                },
                mouth_open: {
                    value: false,
                    confidence: 76.0062484741211
                },
                emotions: [
                    {
                        type: "CALM",
                        confidence: 81.77631378173828
                    },
                    {
                        type: "FEAR",
                        confidence: 6.811796188354492
                    },
                    {
                        type: "SURPRISED",
                        confidence: 6.772216320037842
                    },
                    {
                        type: "SAD",
                        confidence: 6.691151142120361
                    },
                    {
                        type: "ANGRY",
                        confidence: 2.304255723953247
                    },
                    {
                        type: "DISGUSTED",
                        confidence: 2.147843599319458
                    },
                    {
                        type: "HAPPY",
                        confidence: 1.2251189947128296
                    },
                    {
                        type: "CONFUSED",
                        confidence: 0.9095264673233032
                    }
                ]
            },
            quality: {
                brightness: 65.93645477294922,
                sharpness: 97.45164489746094
            },
            confidence: 99.99896240234375,
            bounding_box: {
                width: 0.4954420328140259,
                height: 0.39241859316825867,
                left: 0.27790528535842896,
                top: 0.3333175778388977
            }
        }
    }
}
export const DOJAH_WEBHOOK_EVENT_MOCK_DATA = {
    aml: {
        status: false
    },
    data: {
        id: {
            data: {
                id_url: "https://images.dojah.io/id_sample_id_1720624047.jpg",
                id_data: {
                    extras: "",
                    last_name: "John",
                    first_name: "Doe",
                    mrz_status: "",
                    date_issued: "2019-01-01",
                    expiry_date: "2020-01-01",
                    middle_name: "",
                    nationality: "Nigerian",
                    date_of_birth: "1990-01-01",
                    document_type: "National ID",
                    document_number: "123456789"
                },
                back_url: "https://images.dojah.io/id_sample_id_1720624047.jpg"
            },
            status: true,
            message: "Successfully verified your id"
        },
        email: {
            data: {
                email: "abc@gmail.com"
            },
            status: true,
            message: "abc@gmail.com validation Successful"
        },
        index: {
            data: {},
            status: true,
            message: "Successfully continued to the main checks."
        },
        selfie: {
            data: {
                selfie_url: "https://images.dojah.io/selfie_sample_image_1720624219.jpg"
            },
            status: true,
            message: "Successfully validated your liveness"
        },
        countries: {
            data: {
                country: "Nigeria"
            },
            status: true,
            message: "Successfully continued to the next step."
        },
        user_data: {
            data: {
                dob: "1990-12-03",
                last_name: "John",
                first_name: "Doe"
            },
            status: true,
            message: ""
        },
        business_id: {
            image_url: "https://images.dojah.io/selfie_sample_image_1720624219.jpg",
            business_name: "ABC Company LIMITED",
            business_type: "Business",
            business_number: "1237654",
            business_address: "",
            registration_date: ""
        },
        phone_number: {
            data: {
                phone: "234810123456"
            },
            status: true,
            message: "2348103817187 validation Successful"
        },
        business_data: {
            business_name: null,
            business_type: "BN",
            business_number: null,
            business_address: null,
            registration_date: null
        },
        government_data: {
            data: {
                bvn: {
                    entity: {
                        bvn: "222222222222",
                        nin: "",
                        email: "",
                        title: "",
                        gender: "Male",
                        customer: "6bb82c41-e15e-4308-b99d-e9640818eca9",
                        image_url: "https://images.dojah.io/id_John_Doe_1720615487.jpg",
                        last_name: "John",
                        first_name: "Doe",
                        middle_name: "Anon",
                        nationality: "",
                        name_on_card: "",
                        watch_listed: "",
                        date_of_birth: "01-Jun-1982",
                        lga_of_origin: "",
                        phone_number1: "08011111111",
                        phone_number2: "",
                        marital_status: "",
                        enrollment_bank: "",
                        state_of_origin: "",
                        level_of_account: "",
                        lga_of_residence: "",
                        enrollment_branch: "",
                        registration_date: "",
                        state_of_residence: "",
                        residential_address: ""
                    }
                },
                nin: {
                    entity: {
                        nin: "1234567891",
                        firstname: "John",
                        middlename: "Doe",
                        surname: "Anon",
                        maidenname: "",
                        telephoneno: "0901234567",
                        state: "",
                        place: "",
                        profession: "ZOOLOGY",
                        title: "",
                        height: "167",
                        email: "",
                        birthdate: "1960-01-01",
                        birthstate: "",
                        birthcountry: "Not Available",
                        centralID: "",
                        documentno: "",
                        educationallevel: "tertiary",
                        employmentstatus: "unemployed",
                        othername: "",
                        pfirstname: "",
                        pmiddlename: "",
                        psurname: "",
                        nspokenlang: "YORUBA",
                        ospokenlang: "",
                        religion: "christianity",
                        residence_Town: "",
                        residence_lga: "Alimosho",
                        residence_state: "Lagos",
                        residencestatus: "birth",
                        residence_AddressLine1: "No 2 Anon house, John does estate, Lagos state, Nigeria",
                        residence_AddressLine2: "",
                        self_origin_lga: "",
                        self_origin_place: "",
                        self_origin_state: "",
                        signature: null,
                        nationality: null,
                        gender: "Female",
                        trackingId: "",
                        customer: "1234444y373737373737373737",
                        image_url: "https://images.dojah.io/id_SANDBOX_1721830110.jpg"
                    }
                }
            },
            status: true,
            message: ""
        },
        additional_document: [
            {
                document_url: "https://dojah-image.s3.amazonaws.com/66bcc73a4ff8e1003100454212aec768-3344-4df5-88f6-7e723c46cbb0.jpeg",
                document_type: "image"
            }
        ]
    },
    value: "123456",
    id_url: "https://images.dojah.io/id_sample_id_1720624047.jpg",
    status: true,
    id_type: "BVN",
    message: "Successfully completed the verification.",
    back_url: "https://images.dojah.io/id_sample_id_1720624047.jpg",
    metadata: {
        ipinfo: {
            as: "AS29465 MTN NIGERIA Communication limited",
            isp: "MTN NIGERIA Communication limited",
            lat: 6.4474,
            lon: 3.3903,
            org: "MTN Nigeria",
            zip: "",
            city: "Lagos",
            proxy: false,
            query: "102.89.34.49",
            mobile: true,
            status: "success",
            country: "Nigeria",
            hosting: true,
            district: "",
            timezone: "Africa/Lagos",
            region_name: "Lagos"
        },
        device_info: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    },
    selfie_url: "https://images.dojah.io/selfie_sample_image_1720624219.jpg",
    reference_id: "DJ-31038041E0",
    verification_url: "https://app.dojah.io/verifications/bio-data/49fd74a4-8181-4ce8-a87a-0e63f7159257",
    verification_mode: "LIVENESS",
    verification_type: "RC-NUMBER",
    verification_value: "123456",
    verification_status: "Completed"
}