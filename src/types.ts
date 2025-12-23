declare module "bun" {
	/**
	 * Environment variable type definitions for Bun.
	 */
	interface Env {
		SECRET_1: string;
		SECRET_2: string;
		MIG_FOLDER: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_USER: string;
		POSTGRES_DB: string;
		POSTGRES_HOSTNAME: string;
		POSTGRES_PORT: string;
		POSTGRES_URL: string;
		VALKEY_HOSTNAME: string;
		VALKEY_PORT: string;
		VALKEY_URL: string;
		EMAIL_FROM: string;
		PORT: string;
		DOJAH_APPID: string;
		DOJAH_SECRET: string;
	}
}

export enum CACHE_GET_VALUE {
	Set = "set",
	Hit = "hit"
}

export enum ERROR_RESPONSE_CODES {
	NO_REGISTER_DATA = "NO_REGISTER_DATA",
	INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
	INVALID_OTP = "INVALID_OTP",
	INVALID_TOKEN = "INVALID_TOKEN",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
	TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
	BAD_REQUEST = "BAD_REQUEST",
}

export type DojahNinLookupArgs = {
	nin: string;
}
export type DojahNinLookupResponse = {
	entity: {
		first_name: string;
		last_name: string;
		gender: string;
		middle_name: string;
		photo: string;
		date_of_birth: string;
		email: string;
		phone_number: string;
		employment_status: string;
		marital_status: string;
	}
}
export type DojahBvnValidateArgs = {
	bvn: string;
	firstName: string;
	lastName: string;
}
export type DojahBvnValidateResponse = {
	entity: {
		bvn: {
			/** bvn value */
			value: string,
			/** true if bvn is valid */
			status: boolean
		},
		first_name: {
			/** confidence value 0-100 */
			confidence_value: number,
			/** true if first name is valid */
			status: boolean
		},
		last_name: {
			/** confidence value 0-100 */
			confidence_value: number,
			/** true if last name is valid */
			status: boolean
		}
	}
}
export type DojahVinLookupArgs = {
	/** Voter Identification Number */
	vin: string;
}
export type DojahVinLookupResponse = {
	entity: {
		full_name: string,
		voter_identification_number: string,
		gender: string,
		occupation: string,
		time_of_registration: string,
		state: string,
		local_government: string,
		registration_area_ward: string,
		polling_unit: string,
		polling_unit_code: string,
		address: string,
		phone: string,
		date_of_birth: string
	}
}
export type DojahUtilityBillVerifyArgs = {
	input_type: "url";
	// Image URL of the Utility Bill
	input_value: string;
}
export type DojahUtilityBillVerifyResponse = {
	entity: {
		result: {
			status: string;
			message: string;
		};
		identity_info: {
			full_name: string;
			meter_number: string;
		};
		address_info: {
			street: string;
			city: string;
			state: string;
			country: string;
		};
		provider_name: string;
		bill_issue_date: string;
		amount_paid: string;
		metadata: {
			extraction_date: string;
			is_recent: boolean;
		};
	};
}

export type DojahWebhookVerificationStatus = "Ongoing"
	| "Abandoned"
	| "Completed"
	| "Pending"
	| "Failed"
export type DojahWebhookEventData = {
	aml: {
		status: boolean;
	};
	data: {
		id: {
			data: {
				id_url: string;
				id_data: {
					extras: string;
					last_name: string;
					first_name: string;
					mrz_status: string;
					date_issued: string;
					expiry_date: string;
					middle_name: string;
					nationality: string;
					date_of_birth: string;
					document_type: string;
					document_number: string;
				};
				back_url: string;
			};
			status: boolean;
			message: string;
		};
		email: {
			data: {
				email: string;
			};
			status: boolean;
			message: string;
		};
		index: {
			data: Record<string, any>;
			status: boolean;
			message: string;
		};
		selfie: {
			data: {
				selfie_url: string;
			};
			status: boolean;
			message: string;
		};
		countries: {
			data: {
				country: string;
			};
			status: boolean;
			message: string;
		};
		user_data: {
			data: {
				dob: string;
				last_name: string;
				first_name: string;
			};
			status: boolean;
			message: string;
		};
		business_id: {
			image_url: string;
			business_name: string;
			business_type: string;
			business_number: string;
			business_address: string;
			registration_date: string;
		};
		phone_number: {
			data: {
				phone: string;
			};
			status: boolean;
			message: string;
		};
		business_data: {
			business_name: string | null;
			business_type: string;
			business_number: string | null;
			business_address: string | null;
			registration_date: string | null;
		};
		government_data: {
			data: {
				bvn: {
					entity: {
						bvn: string;
						nin: string;
						email: string;
						title: string;
						gender: string;
						customer: string;
						image_url: string;
						last_name: string;
						first_name: string;
						middle_name: string;
						nationality: string;
						name_on_card: string;
						watch_listed: string;
						date_of_birth: string;
						lga_of_origin: string;
						phone_number1: string;
						phone_number2: string;
						marital_status: string;
						enrollment_bank: string;
						state_of_origin: string;
						level_of_account: string;
						lga_of_residence: string;
						enrollment_branch: string;
						registration_date: string;
						state_of_residence: string;
						residential_address: string;
					};
				};
				nin: {
					entity: {
						nin: string;
						firstname: string;
						middlename: string;
						surname: string;
						maidenname: string;
						telephoneno: string;
						state: string;
						place: string;
						profession: string;
						title: string;
						height: string;
						email: string;
						birthdate: string;
						birthstate: string;
						birthcountry: string;
						centralID: string;
						documentno: string;
						educationallevel: string;
						employmentstatus: string;
						othername: string;
						pfirstname: string;
						pmiddlename: string;
						psurname: string;
						nspokenlang: string;
						ospokenlang: string;
						religion: string;
						residence_Town: string;
						residence_lga: string;
						residence_state: string;
						residencestatus: string;
						residence_AddressLine1: string;
						residence_AddressLine2: string;
						self_origin_lga: string;
						self_origin_place: string;
						self_origin_state: string;
						signature: string | null;
						nationality: string | null;
						gender: string;
						trackingId: string;
						customer: string;
						image_url: string;
					};
				};
			};
			status: boolean;
			message: string;
		};
		additional_document: Array<{
			document_url: string;
			document_type: string;
		}>;
	};
	value: string;
	id_url: string;
	status: boolean;
	id_type: string;
	message: string;
	back_url: string;
	metadata: {
		ipinfo: {
			as: string;
			isp: string;
			lat: number;
			lon: number;
			org: string;
			zip: string;
			city: string;
			proxy: boolean;
			query: string;
			mobile: boolean;
			status: string;
			country: string;
			hosting: boolean;
			district: string;
			timezone: string;
			region_name: string;
		};
		device_info: string;
	};
	selfie_url: string;
	reference_id: string;
	verification_url: string;
	verification_mode: string;
	verification_type: string;
	verification_value: string;
	verification_status: DojahWebhookVerificationStatus;
};