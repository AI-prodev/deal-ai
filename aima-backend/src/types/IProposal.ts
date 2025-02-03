import { Schema, Document } from "mongoose"

export interface IProposal extends Document {
		user: Schema.Types.ObjectId;
		businessName: string;
		businessWebsite: string;
		pdfFile?: Schema.Types.ObjectId;
		docFile?: Schema.Types.ObjectId;
		createdAt: string;
}

