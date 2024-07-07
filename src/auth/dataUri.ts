import DataUriParser from "datauri/parser";
import * as path from "path";

interface DataUriResult {
  content: string;
  mimetype: string;
}

const getDataUri = (files: Express.Multer.File[]): DataUriResult[] => {
  const parser = new DataUriParser();
  return files.map(file => {
    const extName = path.extname(file.originalname).toString();
    const dataUri = parser.format(extName, file.buffer);
    return { content: dataUri?.content || "", mimetype: dataUri?.mimetype || "" };
  });
};

export default getDataUri;
