import React, { useMemo } from "react";
import Modal from "@/components/Modal";
import ModalLight from "@/components/ModalLight";
import { DomainRecord, createDomainApi } from "@/store/features/domainApi";
import { CheckSolidSVG, QuestionSolidSVG } from "../icons/SVGData";

interface Props {
  domainId: string;
  config: { defaultDomainName: string } | null | undefined;
  isOpen: boolean;
  onRequestClose: () => void;
}

const DomainSetupModal: React.FC<Props> = ({
  domainId,
  config,
  isOpen,
  onRequestClose,
}) => {
  const IS_LIGHT_MODE = true;

  const { data: domain } = createDomainApi.useGetDomainQuery({ domainId });
  const { data: domainRecords } = createDomainApi.useCheckDomainRecordsQuery({
    domainId,
  });

  const requiredRecords: DomainRecord[] = useMemo(() => {
    if (!domain || !config) {
      return [];
    }
    const requiredTXTname = `${domain.domain}.`;
    const requiredTXTcontains = `a:${config.defaultDomainName}`;
    const requiredTXTstring = `v=spf1 ${requiredTXTcontains} ~all`;
    const requiredMXname = `${domain.domain}.`;
    const requiredMXtarget = `${config.defaultDomainName}.`;
    return [
      {
        dnsType: "TXT",
        name: requiredTXTname,
        strings: [requiredTXTstring],
        isSet: domainRecords
          ? domainRecords.find(
              d =>
                d.dnsType === "TXT" &&
                d.name === requiredTXTname &&
                d.strings &&
                d.strings.length > 0 &&
                !!d.strings.find(
                  s => s.startsWith("v=spf") && s.includes(requiredTXTcontains)
                )
            )
            ? "yes"
            : "no"
          : "loading",
      },
      {
        dnsType: "MX",
        name: requiredMXname,
        target: requiredMXtarget,
        isSet: domainRecords
          ? domainRecords.find(
              d =>
                d.dnsType === "MX" &&
                d.name === requiredMXname &&
                d.target === requiredMXtarget
            )
            ? "yes"
            : "no"
          : "loading",
      },
    ];
  }, [domain, config, domainRecords]);

  const modalContent = (
    <div>
      <h2
        className={`mb-4 text-lg font-bold ${!IS_LIGHT_MODE && "text-white"}`}
      >
        Domain Setup
      </h2>
      <div>
        <div className="grid grid-cols-3 md:grid-cols-6">
          <div className="md:col-span-1">Type</div>
          <div className="md:col-span-2">Name</div>
          <div className="md:col-span-2">Value</div>
        </div>
      </div>
      <div>
        {requiredRecords.map((record, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 mt-2">
            <div className="col-span-1 flex items-center justify-start text-sm font-bold">
              {record.dnsType}
            </div>
            <div className="mt-2 md:mt-0 col-span-2 flex items-center justify-start text-sm">
              <input
                spellCheck={false}
                readOnly
                className="border rounded border-gray-200 p-1"
                value={record.name}
              />
            </div>
            <div className="mt-2 md:mt-0 col-span-3 flex items-center justify-start text-sm">
              <input
                spellCheck={false}
                readOnly
                className="border rounded border-gray-200 p-1 w-full mr-2"
                value={record.target || (record.strings && record.strings[0])}
              />
              {record.isSet == "loading" && <div className="h-6 w-6"></div>}
              {record.isSet == "no" && (
                <QuestionSolidSVG className="text-gray-300 h-6 w-6" />
              )}
              {record.isSet == "yes" && (
                <CheckSolidSVG className="text-green-500 h-6 w-6" />
              )}
            </div>
          </div>
        ))}
      </div>
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
  );

  return (
    <>
      {IS_LIGHT_MODE ? (
        <ModalLight isOpen={isOpen} onRequestClose={onRequestClose}>
          {modalContent}
        </ModalLight>
      ) : (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
          {modalContent}
        </Modal>
      )}
    </>
  );
};

export default DomainSetupModal;
