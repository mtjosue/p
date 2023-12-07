import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";

export default function Modal() {
  const [open, setOpen] = useState(true);
  const user = useUser();
  const createNewUser = api.user.create.useMutation();

  const onAcceptTerms = () => {
    if (user.user) {
      if (user.user.id) {
        createNewUser.mutate({
          name: user.user?.firstName ?? "",
          userId: user.user.id,
          termsAgreed: true,
        });
      }
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => console.log("Accept Terms @.@")}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-[#1d1d1d] text-left shadow-xl transition-all sm:w-full sm:max-w-sm md:mx-3 md:max-w-none">
                <div className="bg-[#1d1d1d] p-6">
                  <div className="text-left text-white">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-white"
                    >
                      Terms of Service Agreement
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col gap-y-3">
                      <div>
                        By accessing or using Pixelmate, you agree to comply
                        with and be bound by the following terms and conditions
                        (&ldquo;Terms of Service&ldquo;). If you do not agree to
                        these Terms of Service, please do not use the Platform.
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <div>1. Use of the Platform</div>
                        <div>
                          1.1 Eligibility: You must be at least 18 years old to
                          use the Platform.
                        </div>
                        <div>
                          1.2 User Account: You are responsible for maintaining
                          the confidentiality of your account and password and
                          for restricting access to your computer. You agree to
                          accept responsibility for all activities that occur
                          under your account or password.
                        </div>
                        <div>
                          1.3 User Conduct: You agree not to engage in any
                          prohibited conduct, including but not limited to
                          nudity or sexual acts, hate speech or racism, violence
                          or dangerous organization promotion, self harm or life
                          threatening, scam or fraud, sell of illegal or
                          regulated goods, impersonating or underaged, rude or
                          bullying.
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <div>2. User Content</div>
                        <div>
                          2.1 Your Content: By using the Platform, you grant
                          Pixelmate a worldwide, non-exclusive, royalty-free,
                          sublicenseable, and transferable license to use,
                          reproduce, distribute, prepare derivative works of,
                          display, and perform the User Content in connection
                          with the Platform.
                        </div>
                        <div>
                          2.2 Prohibited Content: You agree not to upload, post,
                          or otherwise showcase or make available any content
                          that violates any applicable laws or regulations.
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <div>3. Limitation of Liability</div>
                        <div>
                          3.1 No Liability: Pixelmate shall not be liable for
                          any direct, indirect, incidental, special,
                          consequential, or exemplary damages, including but not
                          limited to, damages for loss of profits, goodwill,
                          use, data, or other intangible losses.
                        </div>
                        <div>
                          3.2 No Warranty: The Platform is provided &ldquo;as
                          is&ldquo; and &ldquo;as available&ldquo; without any
                          representations or warranties, express or implied.
                        </div>
                      </div>
                      <div>
                        4. Termination Pixelmate reserves the right to terminate
                        or suspend your account and access to the Platform at
                        its sole discretion, without notice, for conduct that
                        Pixelmate believes violates these Terms of Service.
                      </div>
                      <div className="flex flex-col gap-y-3">
                        <div>5. Miscellaneous</div>
                        <div>
                          5.1 Governing Law: These Terms of Service are governed
                          by and construed in accordance with the laws of U.S.A.
                        </div>
                        <div>
                          5.2 Changes to Terms: Pixelmate reserves the right to
                          modify or replace these Terms of Service at any time.
                          Your continued use of the Platform after any changes
                          constitutes acceptance of those changes.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="m-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => {
                      setOpen(false);
                      onAcceptTerms();
                    }}
                  >
                    Accept Terms & Conditions
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
