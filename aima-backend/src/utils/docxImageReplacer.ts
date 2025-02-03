/* eslint-disable no-mixed-spaces-and-tabs */

import * as fs from "fs"
import * as https from "https"
import JSZip from "jszip"
import {parseString, Builder} from "xml2js"

// const uuid = require("uuid/v4")

const IMAGE_URI = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
const IMAGE_TYPE = "image/png"

const IMAGE_RETRIEVAL_TYPE = {
    "URL" : "url",
    "LOCAL" : "local",
    "B64" : "b64"
}

const TYPE = "type"
const HEIGHT = "height"
const WIDTH = "width"
const NAME = "name"
const BUFFER = "buffer"
const PATH = "path"
const REL_ID = "rel_id"

//1. replace image - the template image will be given in the docx, take the url/base64 for the new image in the argument, along with the image no.
//2. insert image - use replace tags {{insert_image `variable_name` height width}}, and take variable_name in the arguments.

export class DocxImageReplacer {

    zip: any = null

    /**
		 * Represents a DocxImager instance
		 * @constructor
		 */

    constructor(){
        this.zip = null
    }

    /**
		 * Load the DocxImager instance with the docx.
		 * @param {String} path_or_buffer full path of the template docx, or the buffer
		 * @returns {Promise}
		 */
    async load(path_or_buffer: any) {
        return this.__loadDocx(path_or_buffer).catch((e)=>{
            console.log(e)
        })
    }

    async __loadDocx(path_or_buffer: any){
        const zip = new JSZip()
        let buffer = path_or_buffer
        if(!Buffer.isBuffer(path_or_buffer)){
            buffer = fs.readFileSync(path_or_buffer)
        }
        this.zip = await zip.loadAsync(buffer)
    }

    /**
		 * Replaces the template image with the image obtained from the web url
		 * @param {String} image_uri web uri of the image
		 * @param {String} image_id id of the image in the docx
		 * @param {String} type type of the template image
		 * @returns {Promise}
		 */
    async replaceWithImageURL(image_uri: any, image_id: any, type: any){
        return new Promise((resolve, reject) => {
            this.__validateDocx()
            const req3 = https.request(image_uri, (res) => {
                //console.log(res)
                const buffer: any = []
                res.on("data", (d) => {
                    // console.log("ok")
                    buffer.push(d)
                })
                res.on("end", ()=>{
                    //fs.writeFileSync("t1."+type, Buffer.concat(buffer))
                    //res.headers["content-type"]
                    this.__replaceImage(Buffer.concat(buffer), image_id, type).then(() => {
                        resolve(null)
                    })
                })
            })

            req3.on("error", (e) => {
                console.error(e)
                reject(e)
            })
            req3.end()
        })
    }

    /**
		 * Replaces the template image with the image obtained from the local path
		 * @param {String} image_path full path of the image in the local system
		 * @param {String} image_id id of the image in the docx
		 * @param {String} type type of the template image
		 * @returns {Promise}
		 */
    replaceWithLocalImage(image_path: any, image_id: any, type: any, cbk: any){
        this.__validateDocx()
        const image_buffer = fs.readFileSync(image_path)
        this.__replaceImage(image_buffer, image_id, type, cbk)
    }

    /**
		 * Replaces the template image with the image obtained from the Base64 string
		 * @param {String} base64_string Base64 form of the image
		 * @param {String} image_id id of the image in the docx
		 * @param {String} type type of the template image
		 * @returns {Promise}
		 */
    replaceWithB64Image(base64_string: any, image_id: any, type: any, cbk: any){
        this.__validateDocx()
        this.__replaceImage(Buffer.from(base64_string, "base64"), image_id, type, cbk)
    }

    async __replaceImage(buffer: any, image_id: any, type: any, cbk?: any){
        //1. replace the image
        return new Promise((res, rej)=>{
            try{
                const path = "word/media/image"+image_id+"."+type
                this.zip.file(path, buffer)
                if (cbk) {
                    cbk()
                }
                res(true)
            }catch(e){
                rej()
            }
        })
    }

    // {{insert_image variable_name type width height }} + {variable_name : "image_url"}
    //context - dict of variable_name vs url
    async insertImage(context: any){
        // a. get the list of all variables.
        const variables: any = await this.__getVariableNames()

        //b. download/retrieve images.
        const final_context: any = await this.__getImages(variables, context)

        //deep merge image buffer/name and meta.
        for(const var_name in final_context){
            // eslint-disable-next-line no-prototype-builtins
            if(final_context.hasOwnProperty(var_name)){
                final_context[var_name][TYPE] = variables[var_name][TYPE]
                final_context[var_name][HEIGHT] = variables[var_name][HEIGHT]
                final_context[var_name][WIDTH] = variables[var_name][WIDTH]
            }
        }

        //1. insert entry in [Content-Type].xml
        await this._addContentType(final_context)

        //2. write image in media folder in word/
        /*let image_path = */await this._addImage(final_context)

        //3. insert entry in /word/_rels/document.xml.rels
        //<Relationship Id="rId3" Type=IMAGE_URI Target="media/image2.png"/>
        /*let rel_id = */await this._addRelationship(final_context)

        //4. insert in document.xml after calculating EMU.
        await this._addInDocumentXML(final_context)

        // http://polymathprogrammer.com/2009/10/22/english-metric-units-and-open-xml/
        // https://startbigthinksmall.wordpress.com/2010/01/04/points-inches-and-emus-measuring-units-in-office-open-xml/

    }

    /**
		 * Saves the transformed docx.
		 * @param {String} op_file_name Output file name with full path.
		 * @returns {Promise}
		 */
    async save(op_file_name: any){
        console.log("op_file_name=", op_file_name)
        if(!op_file_name){
            op_file_name = "./merged.docx"
        }
        return new Promise((res, rej)=>{
            this.zip.generateNodeStream({streamFiles : true})
                .pipe(fs.createWriteStream(op_file_name))
                .on("finish", function(x: any){
                    res(null)
                })
        })
    }

    async __getVariableNames(){
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej)=>{
            try{
                let content = await this.zip.file("word/document.xml").async("nodebuffer")
                content = content.toString()
                content = DocxImageReplacer.__cleanXML(content)
                const matches = content.match(/(<w:r>.*?insert_image.*?<\/w:r>)/g)         //match all r tags
                if(matches && matches.length){
                    const variables: any = {}
                    for(let i = 0; i < matches.length; i++){
                        const tag = matches[i].match(/{{(.*?)}}/g)[0]
                        const splits = tag.split(" ")
                        const node: any = {}
                        // node["variable_name"] = splits[1]
                        node[TYPE] = splits[2]
                        node[WIDTH] = splits[3]
                        node[HEIGHT] = splits[4]
                        variables[splits[1]] = node
                    }
                    res(variables)
                }else{
                    rej(new Error("Invalid Docx"))
                }
            }catch(e){
                console.log(e)
                rej(e)
            }
        })
    }

    async __getImages(variables: any, context: any){
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej)=>{
            try{
                const image_map: any = {}
                for(const variable_name in variables){
                    // eslint-disable-next-line no-prototype-builtins
                    if(variables.hasOwnProperty(variable_name)){
                        const path = context[variable_name]
                        //TODO assuming the path is the url, also check for local/b64.
                        const buffer = await this.__getImageBuffer(path, IMAGE_RETRIEVAL_TYPE.URL)
                        const name = "image1"+"."+variables[variable_name][TYPE]
                        image_map[variable_name] = {}
                        image_map[variable_name][NAME] = name
                        image_map[variable_name][BUFFER] = buffer
                    }
                }
                res(image_map)
            }catch(e){
                console.log(e)
                rej(e)
            }
        })
    }

    async __getImageBuffer(path: any, retrieval_type: any){
        return new Promise((res, rej)=>{
            try{
                if(retrieval_type === IMAGE_RETRIEVAL_TYPE.URL){
                    const req = https.request(path, (result) => {
                        const buffer: any = []
                        result.on("data", (d) => {
                            buffer.push(d)
                        })
                        result.on("end", ()=>{
                            res(Buffer.concat(buffer))
                        })
                    })
                    req.on("error", (e) => {
                        throw e
                    })
                    req.end()
                }
            }catch(e){
                console.log(e)
                rej(e)
            }
        })
    }

    async _addContentType(final_context: any) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej)=>{
            try{
                let content = await this.zip.file("[Content_Types].xml").async("nodebuffer")
                content = content.toString()
                const matches = content.match(/<Types.*?>.*/gm)
                if (matches && matches[0]) {
                    // let new_str = matches[0] + "<Default Extension="" + type + "" ContentType="image/" + type + ""/>"
                    let new_str = ""
                    for(const var_name in final_context){
                        // eslint-disable-next-line no-prototype-builtins
                        if(final_context.hasOwnProperty(var_name)){
                            new_str += "<Override PartName=\"/word/media/\"+final_context[var_name][NAME]+\"\" ContentType=\"\"+final_context[var_name][TYPE]+\"\"/>"
                        }
                    }
                    const c = matches[0]+new_str
                    this.zip.file("[Content_Types].xml", content.replace(matches[0], c))
                    res(true)
                }
            }catch(e){
                console.log(e)
                rej(e)
            }
        })
    }

    async _addImage(final_context: any){
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej)=>{
            try{
                // let image_name = uuid()
                // let image_path = "media/"+image_name
                // this.docx.file("word/"+image_path, image_buffer)
                // res(image_path)
                for(const var_name in final_context){
                    // eslint-disable-next-line no-prototype-builtins
                    if(final_context.hasOwnProperty(var_name)){
                        const o = final_context[var_name]
                        const img_path = "media/"+o[NAME]
                        o[PATH] = img_path
                        this.zip.file("word/"+img_path, o[BUFFER])
                    }
                }
                res(true)
            }catch(e){
                console.log(e)
                rej(e)
            }
        })
    }

    async _addRelationship(final_context: any){
        return new Promise(
            // eslint-disable-next-line no-async-promise-executor
            async (res, rej)=>{
                try{
                    const content = await this.zip.file("word/_rels/document.xml.rels").async("nodebuffer")
                    parseString(content.toString(), (err, relation)=>{
                        if(err){
                            console.log(err)       //TODO check if an error thrown will be catched by enclosed try catch
                            rej(err)
                        }
                        let cnt = relation.Relationships.Relationship.length
                        // let rID = "rId"+(cnt+1)
                        // relation.Relationships.Relationship.push({
                        //     $ : {
                        //         Id : rID,
                        //         Type : IMAGE_URI,
                        //         Target : image_path
                        //     }
                        // })
                        for(const var_name in final_context){
                            // eslint-disable-next-line no-prototype-builtins
                            if(final_context.hasOwnProperty(var_name)){
                                const o = final_context[var_name]
                                const rel_id = "rId"+(++cnt)
                                o[REL_ID] = rel_id
                                relation.Relationships.Relationship.push({
                                    $ : {
                                        Id : rel_id,
                                        Type : IMAGE_URI,
                                        Target : o[PATH]
                                    }
                                })
                            }
                        }
                        const builder = new Builder()
                        const modifiedXML = builder.buildObject(relation)
                        this.zip.file("word/_rels/document.xml.rels", modifiedXML)
                        res(true)
                    })
                }catch(e){
                    console.log(e)
                    rej(e)
                }
            })
    }

    async _addInDocumentXML(final_context: any){

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (res, rej)=>{
            try{
                let content = await this.zip.file("word/document.xml").async("nodebuffer")
                content = content.toString()

                content = DocxImageReplacer.__cleanXML(content)
                const matches = content.match(/(<w:r>.*?insert_image.*?<\/w:r>)/g)         //match all runs in p tags containing

                if(matches && matches.length > 0){
                    for(let i = 0; i < matches.length; i++){
                        let xml = matches[i]
                        const regex = new RegExp(/{{(.*?)}}/g)
                        let tag: any = regex.exec(xml)
                        while(tag){
                            tag = tag[0]
                            const splits = tag.split(" ")
                            const var_name = splits[1]
                            const width = splits[2]
                            const height = splits[3]

                            const obj = final_context[var_name]
                            // let xml = DocxImager.__getImgXMLElement(obj[REL_ID], height, width)

                            xml = xml.replace(tag, "</w:t></w:r>"+DocxImageReplacer.__getImgXMLElement(obj[REL_ID], height, width)+"<w:r><w:t>")
                            tag = regex.exec(xml)
                        }
                        content = content.replace(matches[i], xml)
                    }
                    this.zip.file("word/document.xml", content)
                    res(true)
                }else{
                    rej(new Error("Invalid Docx"))
                }
            }catch(e){
                console.log(e)
                rej(e)
            }
        })

    }

    static __cleanXML(xml: any){

        //Simple variable match
        //({{|{(.*?){)(.*?)(}{1,2})(.*?)(?:[^}])(}{1})
        //1. ({{|{(.*?){)   - Match {{ or {<xmltgas...>{{
        //2. (.*?)          -   Match any character
        //3. (}}|}         -   Match } or }}
        //4. (.*?)          -   Match any character
        //5. (?:[^}])       -   KILLER: Stop matching
        //6. }               -   Include the Killer match
        const variable_regex = /({{|{(.*?){)(.*?)(}}|}(.*?)(?:[^}])})/g
        const replacements = xml.match(variable_regex)

        // let replacements = xml.match(/({{#|{{#\/s)(?:(?!}}).)*|({{|{(.*?){)(?:(?!}}).)*|({{(.*?)#|{{#\/s)(?:(?!}}).)*/g)
        // let replacements = xml.match(/({{#|{{#\/s)(?:([^}}]).)*|({{|{(.*?){)(?:([^}}]).)*|({{(.*?)#|{{#\/s)(?:([^}}]).)*/g)
        // let replacements = xml.match(/({{#|{{#\/s)(?:(?!}}).)*|{{(?:(?!}}).)*|({{(.*?)#|{{(.*?)#\/s)(?:(?!}}).)*|{(.*?){(?:(?!}}).)*/g);//|({(.*?){(.*?)#|{{#\/s)(?:(?!}}).)*
        // let replacements = xml.match(/({(.*?){#|{(.*?){#\/s)(?:(?!}(.*?)}).)*|{(.*?){(?:(?!}(.*?)}).)*/g)
        let replaced_text
        if(replacements){
            for(let i = 0; i < replacements.length; i++){
                replaced_text = replacements[i].replace(/<\/w:t>.*?(<w:t>|<w:t [^>]*>)/g, "")
                xml = xml.replace(replacements[i], replaced_text)
            }
        }
        xml = xml.replace(/&quot;/g, "\"")
        xml = xml.replace(/&gt;/g, ">")
        xml = xml.replace(/&lt;/g, "<")
        // xml = xml.replace(/&amp;/g, "&")
        xml = xml.replace(/&apos;/g, "\"")

        return xml
    }

    static __getImgXMLElement(rId: any, height: any, width: any){
        // width and height calculated assuming resolution as 96 dpi
        const calc_height = /*(9525 * height)*/2857500
        const calc_width = /*(9525 * width)*/2857500

        // from web merge
			 // eslint-disable-next-line no-mixed-spaces-and-tabs
			 return "<w:r>"+
								"<w:rPr>" +
										"<w:noProof/>" +
								"</w:rPr>" +
								"<w:drawing>" +
										"<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">" +
												"<wp:extent cx=\"\"+calc_width+\"\" cy=\"\"+calc_height+\"\"/>" +
												"<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>" +
												"<wp:docPr id=\"1402\" name=\"Picture\" descr=\"\"/>" +
												// "<wp:cNvGraphicFramePr>" +
												//     "<a:graphicFrameLocks noChangeAspect="1"/>" +
												// "</wp:cNvGraphicFramePr>" +
												"<wp:cNvGraphicFramePr>" +
														"<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>"+
												"</wp:cNvGraphicFramePr>"+
												"<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">" +
														"<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">" +
																"<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">" +
																		"<pic:nvPicPr>" +
																				"<pic:cNvPr id=\"1\" name=\"Picture\" descr=\"\"/>" +
																				"<pic:cNvPicPr>" +
																						"<a:picLocks noChangeAspect=\"0\" noChangeArrowheads=\"1\"/>" +
																				"</pic:cNvPicPr>" +
																		"</pic:nvPicPr>" +
																		"<pic:blipFill>" +
																		"<a:blip r:embed=\"\"+rId+\"\">" +
        // "<a:extLst>" +
        //     "<a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C2}">" +
        //         "<a14:useLocalDpi val="0"/>" +
        //     "</a:ext>" +
        // "</a:extLst>" +
																		"</a:blip>" +
																		"<a:srcRect/>" +
																		"<a:stretch>" +
																				"<a:fillRect/>" +
																		"</a:stretch>" +
																		"</pic:blipFill>" +
																		"<pic:spPr bwMode=\"auto\">" +
																				"<a:xfrm>" +
																						"<a:off x=\"0\" y=\"0\"/>" +
																						"<a:ext cx=\"\"+calc_width+\"\" cy=\"\"+calc_height+\"\"/>" +
																				"</a:xfrm>" +
																				"<a:prstGeom prst=\"rect\">" +
																						"<a:avLst/>" +
																				"</a:prstGeom>" +
																				"<a:noFill/>" +
																				"<a:ln>" +
																						"<a:noFill/>" +
																				"</a:ln>" +
																		"</pic:spPr>" +
																"</pic:pic>" +
														"</a:graphicData>" +
												"</a:graphic>" +
										"</wp:inline>" +
								"</w:drawing>"+
						"</w:r>"
    }

    __validateDocx(){
        if(!this.zip){
            throw new Error("Invalid docx path or format. Please load docx.")
        }
    }

}
