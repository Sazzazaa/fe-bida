import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import {
  createFnbItem,
  deleteFnbItem,
  getFnbItems,
  updateFnbItem,
} from '../../services/fnbService'
import type { FnbItem, FnbPayload } from '../../types/admin'
import { formatCurrencyVnd } from '../../utils/formatCurrency'
import { getErrorMessage } from '../../utils/getErrorMessage'
import './admin-pages.css'

const CATEGORIES = ['nuoc', 'bia', 'snack'] as const

const emptyForm: FnbPayload = {
  name: '',
  category: 'nuoc',
  price: 0,
  imageUrl: '',
  inStock: true,
}

export function FnbManage() {
  const [rows, setRows] = useState<FnbItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FnbPayload>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FnbPayload, string>>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFnbItems(
        categoryFilter ? { category: categoryFilter } : undefined,
      )
      setRows(data)
    } catch (e) {
      setError(getErrorMessage(e, 'Khong tai duoc menu F&B'))
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(row: FnbItem) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      category: row.category,
      price: row.price,
      imageUrl: row.imageUrl ?? '',
      inStock: row.inStock,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  function validate(): boolean {
    const err: Partial<Record<keyof FnbPayload, string>> = {}
    if (!form.name.trim()) err.name = 'Nhap ten mon'
    if (!form.category.trim()) err.category = 'Chon danh muc'
    if (form.price < 0) err.price = 'Gia phai >= 0'
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const payload: FnbPayload = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl?.trim() || undefined,
        inStock: form.inStock,
      }
      if (editingId) {
        await updateFnbItem(editingId, payload)
      } else {
        await createFnbItem(payload)
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      setError(getErrorMessage(e, 'Luu mon that bai'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xoa mon nay?')) return
    setError(null)
    try {
      await deleteFnbItem(id)
      await load()
    } catch (e) {
      setError(getErrorMessage(e, 'Xoa mon that bai'))
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Quan ly F&B</h1>
      <p className="admin-page-desc">
        CRUD mon an/uong. Loc theo danh muc. API: GET /fnb?category=, POST/PATCH/DELETE
        /fnb/:id
      </p>

      {error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Them mon
        </button>
        <label className="admin-muted" htmlFor="f-cat">
          Danh muc:
        </label>
        <select
          id="f-cat"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            width: 'auto',
            padding: '0.5rem 0.65rem',
            borderRadius: 8,
            border: '1px solid var(--admin-border, #d4d2d8)',
            font: 'inherit',
            background: 'var(--admin-input-bg, #fff)',
            color: 'inherit',
          }}
        >
          <option value="">Tat ca</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
              <th>Danh muc</th>
              <th>Gia</th>
              <th>Trang thai</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  Chua co du lieu hoac API chua ket noi.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.category}</td>
                <td>{formatCurrencyVnd(row.price)}</td>
                <td>{row.inStock ? 'Con hang' : 'Het hang'}</td>
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
        title={editingId ? 'Sua mon' : 'Them mon'}
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
            <label htmlFor="f-name">Ten mon</label>
            <input
              id="f-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name ? (
              <div className="admin-field-error">{formErrors.name}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="f-category">Danh muc</label>
            <select
              id="f-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {formErrors.category ? (
              <div className="admin-field-error">{formErrors.category}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="f-price">Gia (VND)</label>
            <input
              id="f-price"
              type="number"
              min={0}
              step={1000}
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
            />
            {formErrors.price ? (
              <div className="admin-field-error">{formErrors.price}</div>
            ) : null}
          </div>
          <div className="admin-field">
            <label htmlFor="f-img">URL hinh (tuy chon)</label>
            <input
              id="f-img"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="f-stock">
              <input
                id="f-stock"
                type="checkbox"
                checked={form.inStock ?? true}
                onChange={(e) =>
                  setForm((f) => ({ ...f, inStock: e.target.checked }))
                }
              />{' '}
              Con hang
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
