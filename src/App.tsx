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
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);

  const op = useRef<OverlayPanel>(null);
  const [rowId, setRowId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data = await res.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    };
    fetchData();
  }, [page]);

  const onPageChange = (e: DataTableStateEvent) => {
    setPage((e.page || 0) + 1);
  };

  const selectRowById = () => {
    if (rowId !== null) {
      const target = artworks.find((a) => a.id === rowId);
      if (target) {
        if (selectedArtworks.some((a) => a.id === rowId)) {
          setSelectedArtworks((prev) => prev.filter((a) => a.id !== rowId));
        } else {
          setSelectedArtworks((prev) => [...prev, target]);
        }
      }
      setRowId(null);
      op.current?.hide();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Artworks</h1>

      <div className="flex gap-2 mb-3">
        <Button
          label="Select by ID"
          icon="pi pi-angle-down"
          onClick={(e) => op.current?.toggle(e)}
        />
        <OverlayPanel ref={op}>
          <div className="flex flex-col gap-2 p-2">
            <InputNumber
              value={rowId}
              onValueChange={(e) => setRowId(e.value ?? null)}
              placeholder="Enter Artwork ID"
            />
            <Button label="Select/Deselect" onClick={selectRowById} />
          </div>
        </OverlayPanel>
      </div>

      <DataTable
        value={artworks}
        paginator
        rows={12} 
        totalRecords={totalRecords}
        onPage={onPageChange}
        lazy
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
}
