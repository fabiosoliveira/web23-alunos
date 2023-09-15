import { useEffect, useState } from "react";
import If from "../../components/If";
import Loader from "../../components/Loader";
import { Status } from "../../services/Web3Service";
import TopicFileRow from "./TopicFileRow";
import {
  uploadTopicFile,
  getTopicFiles,
  deleteTopicFile,
} from "../../services/ApiService";

type Props = {
  title: string;
  status?: Status;
};

function TopicFiles({ title, status }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [newFile, setNewFile] = useState<File>();
  const [uploadMessage, setUploadMessage] = useState("");

  function onDeleteTopic(fileName: string) {
    if (status !== Status.IDLE)
      return setUploadMessage("You cannot delete this file.");

    setIsLoading(true);
    setUploadMessage("Deleting file...wait...");
    deleteTopicFile(title, fileName)
      .then(() => {
        setUploadMessage("");
        loadFiles();
      })
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setUploadMessage(err.response ? err.response.data : err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    setNewFile(event.target.files[0]);
  }

  function loadFiles() {
    setIsLoading(true);
    getTopicFiles(title)
      .then((files) => setFiles(files))
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setUploadMessage(err.response ? err.response.data : err.message);
        setFiles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function btnUploadClick(): void {
    if (!newFile) return;
    setIsLoading(true);
    setUploadMessage("Uploading file...wait...");
    uploadTopicFile(title, newFile)
      .then(() => {
        setNewFile(undefined);
        setUploadMessage("");
        loadFiles();
      })
      .catch((err) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        setUploadMessage(err.response ? err.response.data : err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="row">
      <div className="col-12">
        <div className="card my-4">
          <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
              <h6 className="text-white text-capitalize ps-3">
                <i className="material-icons opacity-10 me-2">cloud_upload</i>
                Files
              </h6>
            </div>
          </div>
          <div className="card-body px-0 pb-2">
            <If condition={isLoading}>
              <Loader />
            </If>
            <div className="table-responsive p-0">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                      File name
                    </th>
                    <th className="text-secondary opacity-7"></th>
                  </tr>
                </thead>
                <tbody>
                  <If condition={files?.length}>
                    {files.map((file) => (
                      <TopicFileRow
                        key={file}
                        fileName={file}
                        topicTitle={title}
                        status={status}
                        onDelete={() => onDeleteTopic(file)}
                      />
                    ))}
                  </If>
                  <If condition={!files?.length}>
                    <tr>
                      <td colSpan={2}>
                        <p className="ms-3">
                          There are no files for this topic. Upload one first.
                        </p>
                      </td>
                    </tr>
                  </If>
                </tbody>
              </table>
              <hr />
            </div>
            <If condition={status === Status.IDLE}>
              <div className="row mb-3 ms-3">
                <div className="col-md-6 mb-3">
                  <div className="form-group">
                    <h6>Upload a new file:</h6>
                    <div className="input-group input-group-outline">
                      <input
                        type="file"
                        className="form-control"
                        id="newFile"
                        onChange={onFileChange}
                      />
                      <button
                        className="btn bg-gradient-dark mb-0"
                        onClick={btnUploadClick}
                      >
                        <i className="material-icons opacity-10 me-2">
                          cloud_upload
                        </i>
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mt-5 text-danger">{uploadMessage}</div>
              </div>
            </If>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicFiles;
