import { useCallback, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getRevenueReport } from '../../services/revenueService'
import type { RevenueReport } from '../../types/admin'
import { formatCurrencyVnd } from '../../utils/formatCurrency'
import { getErrorMessage } from '../../utils/getErrorMessage'
import './admin-pages.css'

function defaultDateRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 6)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export function Revenue() {
  const initial = useMemo(() => defaultDateRange(), [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [report, setReport] = useState<RevenueReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRevenueReport({ from, to })
      setReport(data)
    } catch (e) {
      setReport(null)
      setError(getErrorMessage(e, 'Khong tai duoc bao cao doanh thu'))
    } finally {
      setLoading(false)
    }
  }, [from, to])

  return (
    <div>
      <h1 className="admin-page-title">Dashboard doanh thu</h1>
      <p className="admin-page-desc">
        Bieu do theo ngay, tong hop va top ban / top mon. API: GET /admin/revenue?from=&to=
      </p>

      {error ? (
        <div className="admin-banner admin-banner--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-toolbar">
        <label className="admin-muted" htmlFor="r-from">
          Tu
        </label>
        <input
          id="r-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={{
            padding: '0.5rem 0.65rem',
            borderRadius: 8,
            border: '1px solid var(--admin-border, #d4d2d8)',
            font: 'inherit',
          }}
        />
        <label className="admin-muted" htmlFor="r-to">
          Den
        </label>
        <input
          id="r-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{
            padding: '0.5rem 0.65rem',
            borderRadius: 8,
            border: '1px solid var(--admin-border, #d4d2d8)',
            font: 'inherit',
          }}
        />
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => void fetchReport()}
          disabled={loading || !from || !to}
        >
          {loading ? 'Dang tai...' : 'Ap dung'}
        </button>
      </div>

      {report ? (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              Tong doanh thu
              <strong>{formatCurrencyVnd(report.totalRevenue)}</strong>
            </div>
            <div className="admin-stat-card">
              So phien
              <strong>{report.sessionCount}</strong>
            </div>
            <div className="admin-stat-card">
              Trung binh / phien
              <strong>{formatCurrencyVnd(report.avgPerSession)}</strong>
            </div>
          </div>

          <div className="admin-chart-card">
            <h3>Doanh thu theo ngay</h3>
            {report.daily.length === 0 ? (
              <p className="admin-muted">Khong co du lieu trong khoang thoi gian nay.</p>
            ) : (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={report.daily} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(
                          Number(v),
                        )
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        formatCurrencyVnd(Number(value ?? 0))
                      }
                      labelFormatter={(l) => String(l)}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="admin-two-col">
            <div className="admin-chart-card">
              <h3>Top 5 ban (so phien)</h3>
              {report.topTables.length === 0 ? (
                <p className="admin-muted">Chua co du lieu.</p>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={report.topTables}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="sessionCount" fill="#6366f1" name="So phien" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="admin-chart-card">
              <h3>Top 5 mon F&B</h3>
              {report.topFnb.length === 0 ? (
                <p className="admin-muted">Chua co du lieu.</p>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={report.topFnb}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="quantitySold" fill="#0d9488" name="So luong ban" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      ) : !loading && !error ? (
        <p className="admin-muted">Chon khoang thoi gian va bam &quot;Ap dung&quot; de xem bao cao.</p>
      ) : null}
    </div>
  )
}
