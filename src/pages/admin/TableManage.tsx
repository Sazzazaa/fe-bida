import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import {
  createTable,
  deleteTable,
  getTables,
  updateTable,
} from '../../services/tableService'
import type { BilliardTable, TablePayload, TableStatus } from '../../types/admin'
import { formatCurrencyVnd } from '../../utils/formatCurrency'
import { getErrorMessage } from '../../utils/getErrorMessage'
import './admin-pages.css'

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Trong',
  playing: 'Dang choi',
  reserved: 'Dat truoc',
  maintenance: 'Bao tri',
}

const STATUSES: TableStatus[] = [
  'available',
  'playing',
  'reserved',
  'maintenance',
]

const emptyForm: TablePayload = {
  name: '',
  type: '',
  pricePerHour: 0,
  position: '',
  status: 'available',
}

export function TableManage() {
  const [rows, setRows] = useState<BilliardTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TablePayload>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TablePayload, string>>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTables()
      setRows(data)
    } catch (e) {
      setError(getErrorMessage(e, 'Khong tai duoc danh sach ban'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(row: BilliardTable) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      type: row.type,
      pricePerHour: row.pricePerHour,
      position: row.position ?? '',
      status: row.status,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  function validate(): boolean {
    const err: Partial<Record<keyof TablePayload, string>> = {}
    if (!form.name.trim()) err.name = 'Nhap ten ban'
    if (!form.type.trim()) err.type = 'Nhap loai ban'
    if (form.pricePerHour < 0) err.pricePerHour = 'Gia phai >= 0'
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const payload: TablePayload = {
        name: form.name.trim(),
        type: form.type.trim(),
        pricePerHour: Number(form.pricePerHour),
        position: form.position?.trim() || undefined,
        status: form.status,
      }
      if (editingId) {
        await updateTable(editingId, payload)
      } else {
        await createTable(payload)
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      setError(getErrorMessage(e, 'Luu ban that bai'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xoa ban nay?')) return
    setError(null)
    try {
      await deleteTable(id)
      await load()
    } catch (e) {
      setError(getErrorMessage(e, 'Xoa ban that bai'))
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Quan ly ban bi-da</h1>
      <p className="admin-page-desc">
        CRUD ban: ten, loai, gia/gio, trang thai. API: GET/POST /tables, PATCH/DELETE
        /tables/:id
      </p>

      {error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Them ban
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => void load()}
          disabled={loading}
        >
          Tai lai
        </button>
        {loading ? <span className="admin-muted">Dang tai...</span> : null}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ten</th>
              <th>Loai</th>
              <th>Gia/gio</th>
              <th>Trang thai</th>
              <th>Vi tri</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-muted">
                  Chua co du lieu hoac API chua ket noi.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{formatCurrencyVnd(row.pricePerHour)}</td>
                <td>{STATUS_LABEL[row.status]}</td>
                <td>{row.position ?? '—'}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => openEdit(row)}
                    >
                      Sua
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      onClick={() => void handleDelete(row.id)}
                    >
                      Xoa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Sua ban' : 'Them ban'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setModalOpen(false)}
            >
              Huy
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => void handleSubmit()}
              disabled={saving}
            >
              {saving ? 'Dang luu...' : 'Luu'}
            </button>
          </>
        }
      >
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="t-name">Ten ban</label>
            <input
              id="t-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name ? (
              <div className="admin-field-error">{formErrors.name}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="t-type">Loai</label>
            <input
              id="t-type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            />
            {formErrors.type ? (
              <div className="admin-field-error">{formErrors.type}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="t-price">Gia / gio (VND)</label>
            <input
              id="t-price"
              type="number"
              min={0}
              step={1000}
              value={form.pricePerHour}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerHour: Number(e.target.value) }))
              }
            />
            {formErrors.pricePerHour ? (
              <div className="admin-field-error">{formErrors.pricePerHour}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="t-pos">Vi tri (tuy chon)</label>
            <input
              id="t-pos"
              value={form.position ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="t-status">Trang thai</label>
            <select
              id="t-status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as TableStatus,
                }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
