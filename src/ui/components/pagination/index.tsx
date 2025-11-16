import { FC } from "react";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../pagination";

interface PaginationProps {
  page: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ page, count, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(count / pageSize);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <PaginationRoot className="flex w-full justify-center" {...{ page, count, pageSize, onPageChange }}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (canGoPrevious) {
                onPageChange(page - 1);
              }
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="flex h-9 items-center justify-center text-sm">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (canGoNext) {
                onPageChange(page + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
};

export { Pagination };