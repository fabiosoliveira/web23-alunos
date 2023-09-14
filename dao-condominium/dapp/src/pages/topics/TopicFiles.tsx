import { useEffect, useState } from "react";
import If from "../../components/If";
import Loader from "../../components/Loader";
import { Status } from "../../services/Web3Service";
import TopicFileRow from "./TopicFileRow";

type Props = {
  title: string;
  status?: Status;
};

function TopicFiles({ title, status }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([
    "myImage.jpg",
    "myZip.rar",
    "myVideo.mp4",
  ]);

  function onDeleteTopic(fileName: string) {
    alert(fileName);
  }

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
                </tbody>
              </table>
            </div>
            <div className="row ms-2">
              <div className="col-md-12 mb-3">
                <a className="btn bg-gradient-dark me-2" href="/topics/new">
                  <i className="material-icons opacity-10 me-2">add</i>
                  Add New Topic
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicFiles;
