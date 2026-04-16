import React from "react";
import { Info } from "lucide-react";
import MarkupRenderer from "./MarkupRenderer";

/**
 * DataTable Component
 * @param {Array} headers - Mảng các tiêu đề cột [{ key: 'action', label: 'Hành động', align: 'left' }]
 * @param {Array} data - Mảng dữ liệu hiển thị
 * @param {Function} renderRow - Hàm tùy chỉnh cách render từng dòng (optional)
 * @param {string} note - Ghi chú dưới chân bảng (optional)
 */
const DataTable = ({ headers, data, renderHead, renderRow, note }) => {
  return (
    <div className="bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            {renderHead ? (
              renderHead(headers, data)
            ) : (
              <tr className="bg-surface-hover/50 text-text-secondary text-[10px] md:text-[12px] font-bold uppercase tracking-widest border-b border-border">
                {headers.map((header, idx) => (
                  <th
                    key={header.key || idx}
                    className={`py-1.5 px-2 md:py-2 md:px-3 border-r border-border last:border-r-0 whitespace-nowrap ${
                      header.align === "center" ? "text-center" : "text-left"
                    }`}
                    style={{ width: header.width || "auto", minWidth: header.minWidth || "auto" }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="hover:bg-surface-hover/30 transition-colors text-[11px] md:text-[13px]"
              >
                {renderRow ? (
                  renderRow(row, rowIdx, headers, data)
                ) : (
                  headers.map((header, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-1.5 px-2 md:py-2 md:px-3 border-r border-border last:border-r-0 text-text-secondary ${
                        header.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      {row[header.key]}
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <div className="px-4 py-2 bg-primary-500/5 border-t border-border text-xs text-text-tertiary flex items-center italic">
          <Info className="w-3 h-3 mr-2 text-primary-500" />
          <MarkupRenderer text={note} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
