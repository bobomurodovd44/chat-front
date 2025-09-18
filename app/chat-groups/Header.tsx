import React, { useEffect } from "react";
import { useSelectedGroupStore } from "../store/selectedGroupStore";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shad-ui/pagination";
import { usePaginationStore } from "../store/messagePaginateStore";

const Header = () => {
  const { selectedGroup } = useSelectedGroupStore();
  const limit = usePaginationStore((s) => s.limit);
  const total = usePaginationStore((s) => s.total);
  const skip = usePaginationStore((s) => s.skip);
  const setSkip = usePaginationStore((s) => s.setSkip);

  const pageCount = total > 0 ? Math.ceil(total / limit) : 0;
  const currentPage = Math.floor(skip / limit) + 1;

  useEffect(() => {
    if (pageCount > 0 && currentPage > pageCount) {
      setSkip((pageCount - 1) * limit);
    }
  }, [total, limit, pageCount, currentPage, setSkip]);

  const goToPage = (page: number) => {
    setSkip((page - 1) * limit);
  };

  // 🔥 Google-style pagination (1 ... 4 5 6 ... 20)
  const renderPageNumbers = () => {
    const pages = [];
    const delta = 2; // hozirgi sahifa atrofida nechta chiqishi kerak

    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(pageCount - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // 1-sahifa
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            goToPage(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Old ellipsis
    if (currentPage - delta > 2) {
      pages.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Atrofdagi sahifalar
    range.forEach((page) => {
      pages.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={currentPage === page}
            onClick={(e) => {
              e.preventDefault();
              goToPage(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });

    // Keyingi ellipsis
    if (currentPage + delta < pageCount - 1) {
      pages.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Oxirgi sahifa
    if (pageCount > 1) {
      pages.push(
        <PaginationItem key={pageCount}>
          <PaginationLink
            href="#"
            isActive={currentPage === pageCount}
            onClick={(e) => {
              e.preventDefault();
              goToPage(pageCount);
            }}
          >
            {pageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="h-[50px] shadow-lg bg-white border-none flex items-center justify-between p-2 ">
      <div className="h-full flex items-center gap-3">
        <p className="font-medium text-xl ml-2 whitespace-nowrap text-gray-900">
          {selectedGroup?.name ? selectedGroup?.name : "Realtime chat app"}
        </p>

        {pageCount > 1 && (
          <Pagination className="bg-gray-300 rounded-md px-2">
            <PaginationContent>
              {/* Prev button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) goToPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {/* Dynamic pages */}
              {renderPageNumbers()}

              {/* Next button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pageCount) goToPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default Header;
