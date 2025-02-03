export const paginationMessage = ({
  from,
  to,
  totalRecords,
}: {
  from: number;
  to: number;
  totalRecords: number;
}): string => `Showing  ${from} to ${to} of ${totalRecords} entries`;
