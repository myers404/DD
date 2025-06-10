package main

import (
	"DD/parser_generator"
	"flag"
	"fmt"
	"log"
	"os"
)

var (
	inputFile     = flag.String("input", "", "Input grammar file")
	goOutput      = flag.String("go", "", "Output directory for Go parser")
	tsOutput      = flag.String("typescript", "", "Output directory for TypeScript parser")
	packageName   = flag.String("package", "parser", "Go package name")
	moduleName    = flag.String("module", "parser", "TypeScript module name")
	validateOnly  = flag.Bool("validate", false, "Only validate grammar")
	createExample = flag.Bool("example", false, "Create example grammar")
	showVersion   = flag.Bool("version", false, "Show version")
	debug         = flag.Bool("debug", false, "Enable debug output")
)

const version = "2.0.0"

func main() {
	flag.Parse()

	if *showVersion {
		fmt.Printf("Parser Generator v%s\n", version)
		return
	}

	if *createExample {
		if err := createExampleGrammar(); err != nil {
			log.Fatalf("Failed to create example: %v", err)
		}
		fmt.Println("Created example.grammar")
		return
	}

	if *inputFile == "" {
		printUsage()
		os.Exit(1)
	}

	config := &parser_generator.Config{
		PackageName: *packageName,
		ModuleName:  *moduleName,
		Debug:       *debug,
	}

	generator := parser_generator.NewGenerator(config)

	// Parse grammar
	grammar, err := parser_generator.ParseGrammarFile(*inputFile)
	if err != nil {
		log.Fatalf("Failed to parse grammar: %v", err)
	}

	// Validate grammar
	if err := generator.Validate(grammar); err != nil {
		log.Fatalf("Grammar validation failed: %v", err)
	}

	if *validateOnly {
		fmt.Println("Grammar validation passed!")
		return
	}

	// Generate parsers
	if *goOutput == "" && *tsOutput == "" {
		log.Fatal("Must specify at least one output (-go or -typescript)")
	}

	if *goOutput != "" {
		if err := generator.GenerateGo(grammar, *goOutput); err != nil {
			log.Fatalf("Failed to generate Go parser: %v", err)
		}
		fmt.Printf("✓ Generated Go parser: %s/parser.go\n", *goOutput)
	}

	if *tsOutput != "" {
		if err := generator.GenerateTypeScript(grammar, *tsOutput); err != nil {
			log.Fatalf("Failed to generate TypeScript parser: %v", err)
		}
		fmt.Printf("✓ Generated TypeScript parser: %s/parser.ts\n", *tsOutput)
	}

	fmt.Println("✓ Generation completed!")
}

func printUsage() {
	fmt.Println("Parser Generator - Create production-quality parsers from grammar specifications")
	fmt.Println("\nUsage:")
	flag.PrintDefaults()
	fmt.Println("\nExamples:")
	fmt.Println("  parser_generator -example")
	fmt.Println("  parser_generator -input expr.grammar -go ./parser -package myparser")
	fmt.Println("  parser_generator -input expr.grammar -typescript ./parser -module myparser")
}

func createExampleGrammar() error {
	content := `// Example Expression Grammar
%name "Expression Language"
%start expression

// Tokens
%token NUMBER    /\d+(\.\d+)?/
%token IDENTIFIER /[a-zA-Z][a-zA-Z0-9_]*/
%token PLUS      "+"
%token MINUS     "-"
%token MULTIPLY  "*"
%token DIVIDE    "/"
%token LPAREN    "("
%token RPAREN    ")"
%token EQ        "=="
%token NE        "!="
%token LT        "<"
%token GT        ">"
%token AND       "&&"
%token OR        "||"
%token NOT       "!"
%token WHITESPACE /\s+/ skip

// Grammar Rules
expression -> or_expr

or_expr -> and_expr (OR and_expr)*
and_expr -> equality (AND equality)*
equality -> comparison ((EQ | NE) comparison)*
comparison -> term ((LT | GT) term)*
term -> factor ((PLUS | MINUS) factor)*
factor -> unary ((MULTIPLY | DIVIDE) unary)*
unary -> NOT unary | primary
primary -> NUMBER | IDENTIFIER | LPAREN expression RPAREN
`

	return os.WriteFile("example.grammar", []byte(content), 0644)
}
