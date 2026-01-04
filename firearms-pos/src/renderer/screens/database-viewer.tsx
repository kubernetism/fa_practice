import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  Database,
  Table as TableIcon,
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Server,
  Bug,
} from 'lucide-react'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-16 text-red-500">
          <Bug className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">{this.state.error?.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Refresh Page
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

interface TableInfo {
  name: string
  sql?: string
}

interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: string | null
  pk: number
}

interface TableData {
  columns: string[]
  rows: Record<string, unknown>[]
  count: number
  page?: number
  limit?: number
  totalPages?: number
}

interface DbInfo {
  path: string
  tableCounts: { name: string; count: number }[]
}

export function DatabaseViewerScreen() {
  const { user } = useAuth()

  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableColumns, setTableColumns] = useState<ColumnInfo[]>([])
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Query runner state
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<TableData | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [isExecutingQuery, setIsExecutingQuery] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  // Admin check
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  // Load tables on mount
  const loadTables = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.api.database.getTables()
      if (result.success) {
        setTables(result.tables || [])
      } else {
        setError(result.error || 'Failed to load tables')
      }
    } catch (err) {
      setError('Failed to connect to database')
      console.error('Error loading tables:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load database info
  const loadDbInfo = useCallback(async () => {
    try {
      const result = await window.api.database.getInfo()
      if (result.success) {
        setDbInfo(result.info)
      }
    } catch (err) {
      console.error('Error loading database info:', err)
    }
  }, [])

  // Load table columns
  const loadTableInfo = useCallback(async (tableName: string) => {
    try {
      const result = await window.api.database.getTableInfo(tableName)
      if (result.success) {
        setTableColumns(result.columns || [])
      }
    } catch (err) {
      console.error('Error loading table info:', err)
    }
  }, [])

  // Load table data
  const loadTableData = useCallback(
    async (tableName: string, page = 1) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await window.api.database.getTableData({
          tableName,
          page,
          limit: pageSize,
        })
        if (result.success) {
          setTableData(result.data)
          setCurrentPage(page)
        } else {
          setError(result.error || 'Failed to load table data')
        }
      } catch (err) {
        setError('Failed to load table data')
        console.error('Error loading table data:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [pageSize]
  )

  // Handle table selection
  const handleTableSelect = async (tableName: string) => {
    try {
      setSelectedTable(tableName)
      setCurrentPage(1)
      setError(null)
      setTableData(null)
      await loadTableInfo(tableName)
      await loadTableData(tableName, 1)
    } catch (err) {
      console.error('Error selecting table:', err)
      setError('Failed to load table data')
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (selectedTable && newPage > 0 && tableData && newPage <= (tableData.totalPages || 1)) {
      loadTableData(selectedTable, newPage)
    }
  }

  // Execute custom query
  const executeQuery = async () => {
    if (!query.trim()) {
      setQueryError('Please enter a query')
      return
    }
    if (!user) {
      setQueryError('User not authenticated')
      return
    }

    setIsExecutingQuery(true)
    setQueryError(null)
    setQueryResult(null)

    try {
      const result = await window.api.database.executeQuery({
        query: query.trim(),
        userId: user.userId,
      })
      if (result.success) {
        setQueryResult(result.data)
        if (result.data?.count === 0) {
          setQueryError('Query returned no results')
        } else {
          setSuccess('Query executed successfully')
          setTimeout(() => setSuccess(null), 3000)
        }
      } else {
        setQueryError(result.error || 'Query execution failed')
      }
    } catch (err) {
      setQueryError('Failed to execute query')
      console.error('Error executing query:', err)
    } finally {
      setIsExecutingQuery(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadTables()
    loadDbInfo()
  }, [loadTables, loadDbInfo])

  // Access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only administrators can access the database viewer. Please contact your administrator
            if you need to view database contents.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Viewer</h1>
          <p className="text-muted-foreground">
            View and query database tables (Admin Only)
          </p>
        </div>
        <Button variant="outline" onClick={loadTables} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Tables
            </CardTitle>
            <CardDescription>
              {tables.length} tables in database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !tables.length ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {tables.map((table) => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleTableSelect(table.name)}
                  >
                    <TableIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{table.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Data */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="w-5 h-5" />
                  {selectedTable || 'Select a Table'}
                </CardTitle>
                {selectedTable && dbInfo && (
                  <CardDescription>
                    {dbInfo.tableCounts.find((t) => t.name === selectedTable)?.count.toLocaleString() || 0} rows
                  </CardDescription>
                )}
              </div>
              {selectedTable && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Rows per page:</Label>
                  <Select value={pageSize.toString()} onValueChange={(v) => {
                    setPageSize(Number(v))
                    setCurrentPage(1)
                    if (selectedTable) loadTableData(selectedTable, 1)
                  }}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedTable ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Database className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a table from the list to view its data</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !tableData || tableData.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <TableIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>This table is empty</p>
              </div>
            ) : (
              <ErrorBoundary>
                <div className="space-y-4">
                  {/* Table Columns Info */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tableColumns.map((col) => (
                      <Badge
                        key={col.name}
                        variant={col.pk ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {col.name}
                        {col.type && <span className="ml-1 opacity-60">({col.type})</span>}
                      </Badge>
                    ))}
                  </div>

                  {/* Data Table */}
                  <div className="border rounded-lg overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted">
                        <TableRow>
                          {Array.isArray(tableData.columns) && tableData.columns.map((col) => (
                            <TableHead key={col} className="whitespace-nowrap">
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(tableData.rows) && tableData.rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {Array.isArray(tableData.columns) && tableData.columns.map((col) => {
                              const cellValue = row && typeof row === 'object' ? (row as Record<string, unknown>)[col] : null
                              return (
                                <TableCell key={col} className="whitespace-nowrap max-w-[300px] truncate">
                                  {cellValue === null || cellValue === undefined ? (
                                    <span className="text-muted-foreground italic">NULL</span>
                                  ) : typeof cellValue === 'object' ? (
                                    <span className="text-muted-foreground text-xs">
                                      {JSON.stringify(cellValue).substring(0, 50)}...
                                    </span>
                                  ) : (
                                    String(cellValue)
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ErrorBoundary>
            )}
            {/* Pagination */}
            {tableData && tableData.totalPages && tableData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {tableData.page} of {tableData.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === tableData.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SQL Query Runner */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            SQL Query Runner
          </CardTitle>
          <CardDescription>
            Execute custom SELECT queries to view data (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="query">
            <TabsList>
              <TabsTrigger value="query">Query</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>
            <TabsContent value="query" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">SQL Query (SELECT only)</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM users WHERE role = 'admin'"
                  className="font-mono min-h-[100px]"
                />
              </div>
              {queryError && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {queryError}
                </div>
              )}
              <Button
                onClick={executeQuery}
                disabled={isExecutingQuery || !query.trim()}
              >
                {isExecutingQuery ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Query
                  </>
                )}
              </Button>
            </TabsContent>
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT * FROM users")}
                >
                  SELECT * FROM users
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT * FROM branches")}
                >
                  SELECT * FROM branches
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT * FROM products LIMIT 50")}
                >
                  SELECT * FROM products LIMIT 50
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT * FROM customers LIMIT 50")}
                >
                  SELECT * FROM customers LIMIT 50
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT * FROM sales ORDER BY created_at DESC LIMIT 50")}
                >
                  Recent Sales (50)
                </Button>
                <Button
                  variant="outline"
                  className="justify-start font-mono text-sm"
                  onClick={() => setQuery("SELECT name, sql FROM sqlite_master WHERE type='table'")}
                >
                  Show All Tables Schema
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Query Results */}
          {queryResult && queryResult.rows.length > 0 && (
            <div className="mt-6">
              <Label className="mb-2">Query Results ({queryResult.count} rows)</Label>
              <div className="border rounded-lg overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted">
                    <TableRow>
                      {queryResult.columns.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(queryResult.rows) && queryResult.rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {Array.isArray(queryResult.columns) && queryResult.columns.map((col) => {
                          const cellValue = row && typeof row === 'object' ? (row as Record<string, unknown>)[col] : null
                          return (
                            <TableCell key={col} className="whitespace-nowrap max-w-[300px] truncate">
                              {cellValue === null || cellValue === undefined ? (
                                <span className="text-muted-foreground italic">NULL</span>
                              ) : typeof cellValue === 'object' ? (
                                <span className="text-muted-foreground text-xs">
                                  {JSON.stringify(cellValue).substring(0, 50)}...
                                </span>
                              ) : (
                                String(cellValue)
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
