-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists document_chunks (
  id bigserial primary key,
  content text, -- corresponds to the document chunk text
  metadata jsonb, -- corresponds to the document metadata
  embedding vector(768) -- 768 dimensions for Gemini text-embedding-004
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create an HNSW index for faster vector search
create index on document_chunks using hnsw (embedding vector_cosine_ops);
