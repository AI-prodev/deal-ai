import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { IDomain } from "@/interfaces/IDomain";

interface DomainInstructionsModalProps {
  domain: IDomain;
  isOpen: boolean;
  onRequestClose: () => void;
}

const DomainInstructionsModal: React.FC<DomainInstructionsModalProps> = ({
  domain,
  isOpen,
  onRequestClose,
}) => {
  const subdomain = useMemo(() => {
    const domainTokens = domain.domain.split(".");
    if (domainTokens.length < 3) {
      return "";
    }
    return domainTokens.slice(0, -2).join(".");
  }, [domain]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Instructions</h2>
        <p className="font-bold text-white">
          How to connect your domain to deal.ai
        </p>
        <p className="text-white mt-2">
          {subdomain ? (
            <>
              In order for your custom domain to work you'll need to log in to
              where you bought your domain and add a CNAME record that points{" "}
              <code className="bg-black p-1 text-sm rounded">{subdomain}</code>{" "}
              at{" "}
              <code className="bg-black p-1 text-sm rounded">
                cname.deal.ai
              </code>
            </>
          ) : (
            <>
              In order for your custom domain to work you'll need to log in to
              where you bought your domain and add an A record that points{" "}
              <code className="bg-black p-1 text-sm rounded">
                {domain.domain}
              </code>{" "}
              at{" "}
              <code className="bg-black p-1 text-sm rounded">
                44.208.221.192
              </code>
            </>
          )}
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onRequestClose}
            className="mr-2 rounded border border-primary px-4 py-2 text-primary"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DomainInstructionsModal;
