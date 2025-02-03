// pages/domains/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddZone from "@/components/domains/ADDzone";
import EditZone from "@/components/domains/EditZone";
import { showSuccessToast } from "@/utils/toast";
import { createDomainApi } from "@/store/features/domainApi";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPageTitle } from "@/store/themeConfigSlice";

const DomainDetailPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle("Domains"));
  }, [dispatch]);

  const [data, setData] = useState<any>([]);
  const [domain, setdomain] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [info, setInfo] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  const { data: session } = useSession();
  const [getZone] = createDomainApi.useGetZoneMutation();
  const [deleteZone] = createDomainApi.useDeleteZoneMutation();

  const handleDelete = async (record: any) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (confirmDelete) {
      try {
        const token = session?.token || "";
        const response = await deleteZone({ domain, record, token });

        if ("data" in response) {
          showSuccessToast({ title: "deleted" });
          setRefresh(prev => prev + 1);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    }
  };

  const editHandler = (item: any) => {
    setEdit(!edit);
    setInfo(item);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id && session?.token) {
          const token = session?.token || "";
          const domainName = id;
          const response = await getZone({ domainName, token });

          if ("data" in response) {
            if (response.data) {
              setdomain(response.data.domain);
              setData(response.data.data.data);
            }
          } else if ("error" in response) {
            console.error("Error fetching records:", response.error);
          }
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchData();
  }, [id, refresh, session?.token]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-6">
          <ul className="flex space-x-2 rtl:space-x-reverse">
            <li>
              <Link href="/domains" className="text-primary hover:underline">
                domains
              </Link>
            </li>
            <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
              <span>{domain}</span>
            </li>
          </ul>
          <p className="text-lg">Edit your DNS zone records</p>
        </div>
      </div>
      {/* Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-transparent dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Value
              </th>
              <th scope="col" className="px-6 py-3"></th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              data.map(
                (item: any) =>
                  item.type !== "NS" &&
                  item.type !== "SOA" && (
                    <tr
                      key={item.id}
                      className="border odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-transparent even:dark:bg-transparent"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                      >
                        {item.type}
                      </th>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="w-1/3 px-6 py-4">{item.content}</td>
                      <td className="w-[150px] px-6 py-4">
                        <button
                          className="flex items-center badge whitespace-nowrap bg-secondary cursor-pointer px-4 py-1"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="w-[150px] px-6 py-4">
                        <button
                          className="ml-2 flex items-center badge whitespace-nowrap bg-primary cursor-pointer px-4 py-1"
                          onClick={() => editHandler(item)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
              )}
          </tbody>
        </table>
      </div>
      <button
        className="flex w-[100px] items-center justify-center rounded-lg bg-primary p-[2px]"
        onClick={() => setAdd(!add)}
      >
        <p className="text-lg text-white">Add</p>
      </button>
      {add && (
        <AddZone
          id={domain}
          setData={setData}
          setRefresh={setRefresh}
          setAdd={setAdd}
        />
      )}
      {edit && (
        <EditZone
          isOpen={edit}
          setEdit={setEdit}
          info={info}
          setRefresh={setRefresh}
        />
      )}
    </div>
  );
};

export default DomainDetailPage;
