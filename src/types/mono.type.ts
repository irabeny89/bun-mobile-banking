export type MonoResponse<D = null, M = null> = {
    status: "successful" | "failed";
    message: string;
    timestamp: string;
    data: D
    meta: {
        total: number,
        page: number,
        previous: string | null,
        next: string | null
    }
}
export type MonoDiscoCode = "ABUJA" | "EKO" | "IKEJA" | "IBADAN" | "ENUGU" | "PH" | "JOS" | "KADUNA" | "KANO" | "BH" | "PROTOGY" | "PHISBOND" | "ACCESSPOWER" | "YOLA" | "ABIA" | "ADAMAWA" | "AKWA IBOM" | "ANAMBRA" | "BAUCHI" | "BAYELSA" | "BENUE" | "BORNO" | "CROSS RIVER" | "DELTA" | "EBONYI" | "EDO" | "EKITI" | "GOMBE" | "IMO" | "JIGAWA" | "KATSINA" | "KEBBI" | "KOGI" | "KWARA" | "LAGOS" | "NASSARAWA" | "NIGER" | "OGUN" | "ONDO" | "OSUN" | "OYO" | "PLATEAU" | "RIVERS" | "SOKOTO" | "TARABA" | "YOBE" | "ZAMFARA" | "FCT"
export type MonoLookupBvnOtpMethods = "email" | "phone" | "phone_1" | "alternate_phone"
export type MonoDataStatus = "AVAILABLE" | "UNAVAILABLE" | "PARTIAL" | "FAILED"
export type MonoAuthScope = "auth" | "reauth";
export type MonoAuthMethod = "mobile_banking" | "internet_banking";
export type MonoInitiateLookupBvnArgs = {
    bvn: string;
    scope?: "bank_accounts" | "identity";
}

export type MonoInitiateLookupBvnResponseData = {
    session_id: string;
    bvn: string;
    methods: {
        method: MonoLookupBvnOtpMethods;
        hint: string;
    }[]
}

export type MonoVerifyBvnOtpArgs = {
    method: MonoLookupBvnOtpMethods;
    phone_number: string;
}

export type MonoVerifyBvnOtpResponseData = null;

export type MonoBvnDetailsArgs = {
    otp: string;
}

export type MonoBvnDetailsResponseData = {
    first_name: string;
    last_name: string;
    middle_name: string;
    dob: string;
    phone_number: string;
    phone_number_2: string | null;
    email: string;
    gender: string;
    state_of_origin: string;
    bvn: string;
    nin: string;
    nationality: string;
    address: string;
    registration_date: string;
    lga_of_origin: string;
    lga_of_Residence: string;
    marital_status: string;
    watch_listed: boolean;
    photoId: string;
}

export type MonoLookupPassportArgs = {
    passport_number: string;
    last_name: string;
    /** YYYY-MM-DD e.g 1996-05-06 */
    date_of_birth: string;
}

export type MonoLookupPassportResponseData = {
    first_name: string
    last_name: string
    middle_name: string
    dob: string
    mobile: string
    photo: string | null
    signature: string | null
    passport_number: string
    gender: string
    issued_at: string
    issued_date: string
    expiry_date: string
    document_type: string
}

export type MonoLookupDriverLicenseArgs = {
    license_number: string;
    date_of_birth: string;
    first_name: string;
    last_name: string;
}

export type MonoLookupDriverLicenseResponseData = {
    gender: string;
    photo: string | null;
    license_no: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    issued_date: string;
    expiry_date: string;
    state_of_issue: string;
    birth_date: string;
}

export type MonoLookupAddressArgs = {
    meter_number: string,
    address: string,
    disco_code: MonoDiscoCode
}

export type MonoLookupAddressResponseData = {
    verified: true,
    house_address: string,
    house_owner: string,
    confidence_level: 1 | 0,
    disco_code: MonoDiscoCode
}

export type MonoLookupNinArgs = {
    nin: string;
}

export type MonoLookupNinResponseData = {
    firstname: string;
    surname: string;
    middlename: string;
    birthdate: string;
    userid: string;
    gender: string;
    telephoneno: string;
    vnin: string;
    self_origin_lga: string;
    heigth: string;
    birthstate: string;
    signature: string | null;
    religion: string;
    educationallevel: string;
    maritalstatus: string;
    self_origin_state: string;
    spoken_language: string;
    self_origin_place: string;
    residence_town: string;
    nok_town: string;
    residence_state: string;
    residence_address: string;
    birthcountry: string;
    psurname: string;
    pfirstname: string;
    nok_lga: string;
    nok_address2: string;
    nok_state: string;
    nok_surname: string;
    nok_firstname: string;
    ospokenlang: string;
    residencestatus: string;
    pmiddlename: string;
    email: string;
    nok_postalcode: string;
    nin: string;
    employmentstatus: string;
    birthlga: string;
    residence_lga: string;
    title: string;
    profession: string;
    nok_address1: string;
    photo: string | null;
    nok_middlename: string;
    tracking_id: string;
    central_iD: string;
};

export type MonoConnectAuthAccountLinkingArgs = {
    customer: {
        name: string,
        email: string
    },
    /** store any metadata you want to pass to the callback url or webhook */
    meta: {
        /** 10 characters */
        ref: string
    },
    scope: MonoAuthScope,
    redirect_url: string
}

export type MonoConnectAuthAccountLinkingResponseData = {
    mono_url: string,
    customer: string,
    meta: {
        ref: string
    },
    scope: "auth" | "reauth",
    institution: {
        id: string;
        auth_method: string
    },
    redirect_url: string,
    is_multi: boolean,
    created_at: string
}

export type MonoConnectAuthAccountExchangeTokenArgs = {
    code: string;
}

export type MonoConnectAuthAccountExchangeTokenResponseData = {
    id: string;
}

export type MonoConnectReauthAccountLinkingArgs = {
    account: string,
} & Omit<MonoConnectAuthAccountLinkingArgs, "customer">

export type MonoConnectReauthAccountLinkingResponseData = MonoConnectAuthAccountLinkingResponseData

export type MonoAccountBalanceResponseData = {
    id: string,
    name: string,
    account_number: string,
    balance: number,
    currency: string
}

export type MonoAccountTransactionsResponseData = Array<{
    id: string
    narration: string
    amount: number
    type: string
    balance: number
    date: string
    category: string
}>

export type MonoAccountDetailsResponseData = {
    account: {
        id: string,
        name: string,
        account_number: string,
        currency: string,
        balance: number,
        type: string,
        bvn: string,
        institution: {
            name: string,
            bank_code: string,
            type: string
        }
    },
    customer: {
        id: string
    },
    meta: {
        data_status: MonoDataStatus,
        auth_method: MonoAuthMethod,
        retrieved_data: string[]
    }
}