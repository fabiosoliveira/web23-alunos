"use client";
import { ChangeEvent, InputHTMLAttributes, useState } from "react";
import { NewNFT, uploadAndCreate } from "../services/Web3Service";

export function FormCreate() {
  const [nft, setNft] = useState<NewNFT>();
  const [message, setMessage] = useState<string>("");

  function onInputChange(evt: ChangeEvent<HTMLInputElement>) {
    setNft((state) => ({ ...state, [evt.target.id]: evt.target.value }));
  }

  function onFileChange(evt: ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files.length) {
      const file = evt.target.files[0];
      setNft((state) => ({ ...state, image: file }));
    }
  }

  function btnSubmitClick() {
    if (!nft) return;
    setMessage("Sending your NFT to blockchain...wait...");
    uploadAndCreate(nft)
      .then((itemId) => {
        setMessage(`NFT created successfully!`);
        window.location.href = `/datails/${itemId}`;
      })
      .catch((err) => setMessage(err.message));
  }

  return (
    <form>
      <Input
        id="name"
        label="Name"
        value={nft?.name || ""}
        onChange={onInputChange}
      />
      <Input
        id="description"
        label="Author"
        value={nft?.description || ""}
        onChange={onInputChange}
      />
      <Input
        id="price"
        label="Price (MATIC)"
        type="number"
        value={nft?.price || ""}
        onChange={onInputChange}
      />
      <Input id="image" label="Image" type="file" onChange={onFileChange} />
      <button
        type="button"
        className="bg-gradient-to-t bg-primary-500 font-bold from-primary-500 hover:bg-primary-600 hover:from-primary-600 hover:to-primary-500 inline-block px-12 py-2 rounded text-white to-primary-400"
        onClick={btnSubmitClick}
      >
        Submit
      </button>
      {message && <p className="font-bold mt-5">{message}</p>}
    </form>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

function Input({ id, label, ...props }: InputProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
        {...props}
      />
    </div>
  );
}
