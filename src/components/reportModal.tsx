import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/utils/api";
import bully from "../../public/stop-bullying.png";
import psych from "../../public/psychology.png";
import phish from "../../public/phishing.png";
import illegal from "../../public/illegal.png";
import under from "../../public/underage.png";
import rated from "../../public/registered.png";
import swear from "../../public/swearing.png";
import novi from "../../public/no-violence.png";
import Image from "next/image";
import { useRemoteUserId } from "~/stores/useLocalUser";
import { useRouter } from "next/router";

export default function ReportModal({
  toggle,
  toggler,
  dataObject,
  sendReport,
}: {
  toggle?: boolean;
  toggler: (bol: boolean) => void;
  dataObject: {
    userId: string;
    skips: boolean | null;
    status: boolean | null;
    hypeLikes: number | null;
    hypeHearts: number | null;
    hypeLaughs: number | null;
    hypeWoahs: number | null;
    hypeFires: number | null;
    hypeClaps: number | null;
  };
  sendReport?: (num: number) => Promise<void>;
}) {
  const remoteUserId = useRemoteUserId();
  const router = useRouter();

  const reportUser = api.user.report.useMutation();
  const statusUpdate = api.user.statusUpdate.useMutation();

  const reportTypes = [
    { name: "Nudity or Sexual Activity", level: 3, img: rated },
    { name: "Hate Speech or Racism", level: 3, img: swear },
    { name: "Violence or Dangerous Organization", level: 3, img: novi },
    { name: "Self Harm or Life Threatening", level: 3, img: psych },
    { name: "Scam or Fraud", level: 2, img: phish },
    { name: "Sell of Illegal or Regulated Goods", level: 2, img: illegal },
    { name: "Impersonating or Underaged", level: 1, img: under },
    { name: "Rude or Bullying", level: 1, img: bully },
  ];

  return (
    <Transition.Root show={toggle} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={toggler}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-3">
          {/* <div className="flex min-h-full justify-center p-4 text-center sm:items-center sm:p-0"> */}
          <div className="flex min-h-full justify-center text-center sm:items-center ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {/* <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#121212] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6"> */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#121212] text-left shadow-xl transition-all sm:h-[90vh] sm:w-full sm:max-w-md">
                <div className="h-full p-3">
                  <button
                    onClick={() => toggler(false)}
                    className="absolute right-0 top-0 m-3 text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-9 w-9"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-12 w-12"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 h-full text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-white"
                    >
                      Reports are taken seriously, are you sure?
                    </Dialog.Title>
                    <div className="mt-3 flex h-full flex-col justify-between md:justify-evenly">
                      {reportTypes.map((report, idx) => {
                        return (
                          <button
                            key={`reports-${idx}`}
                            className="inline-flex w-full items-center justify-between rounded-md bg-[#1d1d1d] px-3 py-2 text-left text-base font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            onClick={async () => {
                              if (sendReport) {
                                await sendReport(report.level);
                              }

                              if (remoteUserId) {
                                reportUser.mutate({
                                  userId: remoteUserId,
                                  report: report.level,
                                });
                              }

                              statusUpdate.mutate(dataObject);
                              await router.push("/waiting");
                            }}
                          >
                            <span className="mr-1">{report.name}</span>
                            {report.img && (
                              <div>
                                <Image
                                  src={report.img}
                                  alt=""
                                  className="h-14 w-14"
                                />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
