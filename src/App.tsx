import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import type { DataTableStateEvent } from "primereact/datatable";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export default function ArtworksTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  const op = useRef<OverlayPanel>(null);
  const [rowId, setRowId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page + 1}`
        );
        const data = await res.json();
        setArtworks(data.data);
        setTotalRecords(data.pagination.total);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const onPageChange = (e: DataTableStateEvent) => {
    setPage(e.page ?? 0);
  };

  const selectRowById = async () => {
    if (rowId != null && rowId > 0) {
      const rowsPerPage = 12;
      const totalRowsToSelect = rowId;
      const selectedRows: Artwork[] = [];
      
      const pagesNeeded = Math.ceil(totalRowsToSelect / rowsPerPage);
      
      try {
        for (let i = 0; i < pagesNeeded; i++) {
          const pageNumber = i + 1;
          const res = await fetch(
            `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
          );
          const data = await res.json();
          
          const remainingRows = totalRowsToSelect - selectedRows.length;
          const rowsToTake = Math.min(remainingRows, data.data.length);
          
          selectedRows.push(...data.data.slice(0, rowsToTake));
          
          if (selectedRows.length >= totalRowsToSelect) {
            break;
          }
        }
        
        setSelectedArtworks(selectedRows);
      } catch (error) {
        console.error("Error fetching artworks for selection:", error);
      }
      
      setRowId(null);
      if (op.current) {
        op.current.hide();
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Artworks</h1>

      <div className="card flex justify-content-start mb-3">
        <Button
          type="button"
          icon="pi pi-angle-down"
          label="Select Row"
          onClick={(e) => op.current?.toggle(e)}
        />
        <OverlayPanel ref={op}>
          <div className="flex flex-col gap-2 p-2">
            <InputNumber
              value={rowId}
              onValueChange={(e) => setRowId(e.value ?? null)}
              placeholder="Enter number of rows"
              min={1}
            />
            <Button label="Submit" onClick={selectRowById} />
          </div>
        </OverlayPanel>
      </div>

      <DataTable
        value={artworks}
        lazy
        paginator
        rows={12}
        first={page * 12}
        tableStyle={{ minWidth: '50rem' }}
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={loading}
        dataKey="id"
        selectionMode='multiple'
        selection={selectedArtworks}
        onSelectionChange={(e: any) => setSelectedArtworks(e.value)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title" style={{ width: '25%' }} />
        <Column field="place_of_origin" header="Origin" style={{ width: '25%' }} />
        <Column field="artist_display" header="Artist" style={{ width: '25%' }} />
        <Column field="inscriptions" header="Inscriptions" style={{ width: '25%' }} />
        <Column field="date_start" header="Start Date" style={{ width: '25%' }} />
        <Column field="date_end" header="End Date" style={{ width: '25%' }} />
      </DataTable>
    </div>
  );
}