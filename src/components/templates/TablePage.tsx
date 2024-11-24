interface TablePageProps<T> {
  title: string
  data: T[]
  loading?: boolean
  columns: Column<T>[]
  actions?: React.ReactNode
}

export function TablePage<T>({ 
  title, 
  data, 
  loading, 
  columns, 
  actions 
}: TablePageProps<T>) {
  return (
    <PageLayout
      title={title}
      actions={actions}
    >
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
      />
    </PageLayout>
  )
} 