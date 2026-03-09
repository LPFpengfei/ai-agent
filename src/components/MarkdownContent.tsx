import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-body text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 代码块
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <pre className="bg-[#0d1117] rounded-lg p-4 my-2 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // 表格
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-gray-600">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }: any) {
            return (
              <th className="border border-gray-600 bg-gray-700 px-3 py-2 text-left">
                {children}
              </th>
            )
          },
          td({ children }: any) {
            return (
              <td className="border border-gray-600 px-3 py-2">
                {children}
              </td>
            )
          },
          // 引用
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-indigo-500 pl-4 my-2 text-gray-300 italic">
                {children}
              </blockquote>
            )
          },
          // 列表
          ul({ children }: any) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
          },
          ol({ children }: any) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
          },
          // 链接
          a({ children, href }: any) {
            return (
              <a
                href={href}
                className="text-indigo-400 hover:text-indigo-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
          // 标题
          h1({ children }: any) {
            return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
          },
          h2({ children }: any) {
            return <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
          },
          h3({ children }: any) {
            return <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>
          },
          // 段落
          p({ children }: any) {
            return <p className="my-2">{children}</p>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
